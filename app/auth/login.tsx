import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const { login, state } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Login Failed", state.error || "Please try again");
    }
  };

  return (
    <ScreenContainer containerClassName={`bg-gradient-to-b from-[${colors.primary}] to-[${colors.background}]`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, justifyContent: "space-between", paddingHorizontal: 24, paddingVertical: 40 }}>
          {/* Header */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🎯</Text>
            <Text style={{ fontSize: 32, fontWeight: "bold", color: colors.foreground, marginBottom: 8 }}>
              FocusFlow
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center" }}>
              Your personal productivity companion
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: 16 }}>
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
              <View style={{ position: "relative" }}>
                <TextInput
                  placeholder="Enter your password"
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

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={state.isLoading || !email || !password}
              style={({ pressed }) => ({
                backgroundColor: state.isLoading || !email || !password ? colors.border : colors.primary,
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
                  Login
                </Text>
              )}
            </Pressable>
          </View>

          {/* Signup Link */}
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 14, color: colors.muted }}>Don't have an account?</Text>
            <Pressable onPress={() => router.push("/auth/signup")}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary }}>
                Sign up
              </Text>
            </Pressable>
          </View>

          {/* Demo Credentials */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
              Demo Credentials:
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
              Email: demo@example.com
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              Password: demo123
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
