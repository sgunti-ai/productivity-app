import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SearchHistory {
  query: string;
  timestamp: number;
  count: number; // how many times searched
}

export interface SearchAnalytics {
  totalSearches: number;
  uniqueQueries: number;
  topSearches: SearchHistory[];
  lastUpdated: number;
}

const SEARCH_HISTORY_KEY = "@focusflow_search_history";
const SEARCH_ANALYTICS_KEY = "@focusflow_search_analytics";

/**
 * Add a search query to history and update analytics
 */
export async function recordSearch(query: string): Promise<void> {
  if (!query.trim()) return;

  try {
    const lowerQuery = query.toLowerCase().trim();

    // Get existing history
    const historyJson = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    let history: SearchHistory[] = historyJson ? JSON.parse(historyJson) : [];

    // Check if query already exists
    const existingIndex = history.findIndex((h) => h.query.toLowerCase() === lowerQuery);

    if (existingIndex >= 0) {
      // Update existing entry
      history[existingIndex].count += 1;
      history[existingIndex].timestamp = Date.now();
    } else {
      // Add new entry
      history.push({
        query: lowerQuery,
        timestamp: Date.now(),
        count: 1,
      });
    }

    // Keep only last 50 searches
    history = history.slice(-50);

    // Save updated history
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));

    // Update analytics
    await updateAnalytics(history);
  } catch (error) {
    console.error("Error recording search:", error);
  }
}

/**
 * Get search history
 */
export async function getSearchHistory(): Promise<SearchHistory[]> {
  try {
    const historyJson = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("Error getting search history:", error);
    return [];
  }
}

/**
 * Get top searches (sorted by count, then by recency)
 */
export async function getTopSearches(limit: number = 10): Promise<SearchHistory[]> {
  try {
    const history = await getSearchHistory();
    return history
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return b.timestamp - a.timestamp;
      })
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting top searches:", error);
    return [];
  }
}

/**
 * Get recent searches (sorted by timestamp)
 */
export async function getRecentSearches(limit: number = 5): Promise<SearchHistory[]> {
  try {
    const history = await getSearchHistory();
    return history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting recent searches:", error);
    return [];
  }
}

/**
 * Clear search history
 */
export async function clearSearchHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    await AsyncStorage.removeItem(SEARCH_ANALYTICS_KEY);
  } catch (error) {
    console.error("Error clearing search history:", error);
  }
}

/**
 * Update search analytics
 */
async function updateAnalytics(history: SearchHistory[]): Promise<void> {
  try {
    const uniqueQueries = new Set(history.map((h) => h.query.toLowerCase())).size;
    const totalSearches = history.reduce((sum, h) => sum + h.count, 0);

    const topSearches = history
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return b.timestamp - a.timestamp;
      })
      .slice(0, 10);

    const analytics: SearchAnalytics = {
      totalSearches,
      uniqueQueries,
      topSearches,
      lastUpdated: Date.now(),
    };

    await AsyncStorage.setItem(SEARCH_ANALYTICS_KEY, JSON.stringify(analytics));
  } catch (error) {
    console.error("Error updating analytics:", error);
  }
}

/**
 * Get search analytics
 */
export async function getSearchAnalytics(): Promise<SearchAnalytics | null> {
  try {
    const analyticsJson = await AsyncStorage.getItem(SEARCH_ANALYTICS_KEY);
    return analyticsJson ? JSON.parse(analyticsJson) : null;
  } catch (error) {
    console.error("Error getting analytics:", error);
    return null;
  }
}
