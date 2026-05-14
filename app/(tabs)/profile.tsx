import { ScrollView, View, Text, Pressable, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(state.user?.name || "");

  const handleSaveName = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    await updateProfile(name);
    setIsEditing(false);
    Alert.alert("Success", "Profile updated");
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Logout",
        onPress: async () => {
          await logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.foreground, marginBottom: 24 }}>
          Profile
        </Text>

        {/* User Avatar */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.primary,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 48 }}>👤</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>
            {state.user?.name}
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
            {state.user?.email}
          </Text>
        </View>

        {/* Edit Name Section */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
              Full Name
            </Text>
            {!isEditing && (
              <Pressable onPress={() => setIsEditing(true)}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary }}>
                  Edit
                </Text>
              </Pressable>
            )}
          </View>

          {isEditing ? (
            <View style={{ gap: 12 }}>
              <TextInput
                value={name}
                onChangeText={setName}
                style={{
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: colors.foreground,
                  fontSize: 16,
                }}
                placeholderTextColor={colors.muted}
              />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Pressable
                  onPress={() => {
                    setName(state.user?.name || "");
                    setIsEditing(false);
                  }}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: colors.surface,
                    opacity: pressed ? 0.8 : 1,
                    alignItems: "center",
                  })}
                >
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveName}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.8 : 1,
                    alignItems: "center",
                  })}
                >
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "white" }}>
                    Save
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ fontSize: 16, color: colors.foreground }}>
                {state.user?.name}
              </Text>
            </View>
          )}
        </View>

        {/* Account Info */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 32,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            Account Information
          </Text>
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
                Email
              </Text>
              <Text style={{ fontSize: 14, color: colors.foreground }}>
                {state.user?.email}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
                Member Since
              </Text>
              <Text style={{ fontSize: 14, color: colors.foreground }}>
                {state.user?.createdAt ? new Date(state.user.createdAt).toLocaleDateString() : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => ({
            paddingVertical: 14,
            borderRadius: 8,
            backgroundColor: colors.error,
            opacity: pressed ? 0.8 : 1,
            alignItems: "center",
            marginBottom: 20,
          })}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: "white" }}>
            Logout
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
