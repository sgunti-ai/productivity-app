import { Stack } from "expo-router";

export default function DrawerTabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="tasks" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="habits" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="task-modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="goal-modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="habit-modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}
