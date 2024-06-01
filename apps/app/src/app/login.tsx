import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { AuthForm } from "src/components/authForm";
import { Text } from "~/components/ui/text";
import { AlertCircle } from "~/lib/icons/AlertCircle";
import { useLogin } from "../hooks/useLogin";

const Login = () => {
  const { login, isPending } = useLogin();
  const [error, setError] = useState<string | null>(null);
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();

  return (
    <View className="max-w-md mr-auto ml-auto">
      <AuthForm
        onSubmit={async ({ password, username }) => {
          const sessionKey = await login({
            userIdentifier: username,
            password,
          });
          if (!sessionKey) {
            setError("Failed to login");
            return;
          }
          if (redirect) {
            router.navigate(redirect);
            return;
          }
          router.navigate("/");
        }}
        children={<Text>Login</Text>}
        isPending={isPending}
      />

      {error && (
        <View className="mt-4">
          <AlertCircle className="h-4 w-4" />
          {/* TODO proper styling */}
          <Text>Error</Text>
          <Text>Failed to log in</Text>
        </View>
      )}
    </View>
  );
};

export default Login;
