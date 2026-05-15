import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function SignupScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signup, state } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      await signup(name, email, password);
      router.replace("/drawer-layout");
    } catch (error) {
      Alert.alert("Signup Failed", state.error || "Please try again");
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, justifyContent: "space-between", paddingHorizontal: 24, paddingVertical: 40 }}>
          {/* Header */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🎯</Text>
            <Text style={{ fontSize: 32, fontWeight: "bold", color: colors.foreground, marginBottom: 8 }}>
              Create Account
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center" }}>
              Join FocusFlow and boost your productivity
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: 16 }}>
            {/* Name Input */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
                Full Name
              </Text>
              <TextInput
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                editable={!state.isLoading}
                style={{
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: colors.foreground,
                  fontSize: 16,
                }}
                placeholderTextColor={colors.muted}
              />
            </View>

            {/* Email Input */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
                Email
              </Text>
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!state.isLoading}
                style={{
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: colors.foreground,
                  fontSize: 16,
                }}
                placeholderTextColor={colors.muted}
              />
            </View>

            {/* Password Input */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
                Password
              </Text>
              <TextInput
                placeholder="At least 6 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!state.isLoading}
                style={{
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: colors.foreground,
                  fontSize: 16,
                }}
                placeholderTextColor={colors.muted}
              />
            </View>

            {/* Confirm Password Input */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
                Confirm Password
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  editable={!state.isLoading}
                  style={{
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    paddingRight: 40,
                    color: colors.foreground,
                    fontSize: 16,
                  }}
                  placeholderTextColor={colors.muted}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 12, top: 12 }}
                >
                  <Text style={{ fontSize: 18, color: colors.muted }}>
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Error Message */}
            {state.error && (
              <View style={{ backgroundColor: colors.error, borderRadius: 8, padding: 12 }}>
                <Text style={{ color: "white", fontSize: 14 }}>{state.error}</Text>
              </View>
            )}

            {/* Signup Button */}
            <Pressable
              onPress={handleSignup}
              disabled={state.isLoading || !name || !email || !password || !confirmPassword}
              style={({ pressed }) => ({
                backgroundColor:
                  state.isLoading || !name || !email || !password || !confirmPassword
                    ? colors.border
                    : colors.primary,
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: "center",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              {state.isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: "600", color: "white" }}>
                  Create Account
                </Text>
              )}
            </Pressable>
          </View>

          {/* Login Link */}
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 14, color: colors.muted }}>Already have an account?</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary }}>
                Login
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
