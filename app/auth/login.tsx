import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator, Animated } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const { login, state } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Animation values
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(formSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace("/drawer-layout/(drawer-tabs)" as any);
    } catch (error) {
      Alert.alert("Login Failed", state.error || "Please try again");
    }
  };

  return (
    <ScreenContainer
      containerClassName="flex-1"
      style={{
        backgroundColor: colors.background,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ backgroundColor: colors.background }}
      >
        <View style={{ flex: 1, justifyContent: "space-between", paddingHorizontal: 24, paddingVertical: 40 }}>
          {/* Animated Header */}
          <Animated.View
            style={{
              alignItems: "center",
              marginBottom: 40,
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            }}
          >
            {/* Gradient Background Circle */}
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: colors.primary,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Text style={{ fontSize: 50 }}>🎯</Text>
            </View>
            <Text style={{ fontSize: 32, fontWeight: "bold", color: colors.foreground, marginBottom: 8 }}>
              FocusFlow
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center", lineHeight: 20 }}>
              Your personal productivity companion
            </Text>
          </Animated.View>

          {/* Animated Form */}
          <Animated.View
            style={{
              gap: 16,
              transform: [{ translateY: formSlide }],
              opacity: formOpacity,
            }}
          >
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
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: email ? colors.primary : colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: colors.foreground,
                  fontSize: 16,
                  backgroundColor: colors.surface,
                  fontWeight: "500",
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
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: password ? colors.primary : colors.border,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    paddingRight: 48,
                    color: colors.foreground,
                    fontSize: 16,
                    backgroundColor: colors.surface,
                    fontWeight: "500",
                  }}
                  placeholderTextColor={colors.muted}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={({ pressed }) => ({
                    position: "absolute",
                    right: 16,
                    top: 14,
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <Text style={{ fontSize: 20, color: colors.muted }}>
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Error Message */}
            {state.error && (
              <View
                style={{
                  backgroundColor: colors.error,
                  borderRadius: 12,
                  padding: 14,
                  borderLeftWidth: 4,
                  borderLeftColor: "#ff6b6b",
                }}
              >
                <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>
                  {state.error}
                </Text>
              </View>
            )}

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={state.isLoading || !email || !password}
              style={({ pressed }) => ({
                backgroundColor: state.isLoading || !email || !password ? colors.border : colors.primary,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.85 : 1,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: state.isLoading || !email || !password ? 0 : 0.25,
                shadowRadius: 8,
                elevation: state.isLoading || !email || !password ? 0 : 5,
              })}
            >
              {state.isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: "700", color: "white", letterSpacing: 0.5 }}>
                  Login
                </Text>
              )}
            </Pressable>
          </Animated.View>

          {/* Signup Link */}
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 14, color: colors.muted }}>Don't have an account?</Text>
            <Pressable onPress={() => router.push("/auth/signup")}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.primary }}>
                Sign up
              </Text>
            </Pressable>
          </View>

          {/* Demo Credentials Card */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 14,
              borderWidth: 1,
              borderColor: colors.border,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700", color: colors.foreground, marginBottom: 8 }}>
              📝 Demo Credentials:
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4, fontFamily: "monospace" }}>
              Email: demo@example.com
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, fontFamily: "monospace" }}>
              Password: demo123
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
