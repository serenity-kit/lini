import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { AlertCircle } from "~/lib/icons/AlertCircle";
import { AuthForm } from "../components/authForm";
import { useRegisterAndLogin } from "../hooks/useRegisterAndLogin";

const Register = () => {
  const { registerAndLogin, isPending } = useRegisterAndLogin();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const [error, setError] = useState<string | null>(null);

  return (
    <View className="max-w-md mr-auto ml-auto">
      <AuthForm
        onSubmit={async ({ password, username }) => {
          const sessionKey = await registerAndLogin({
            userIdentifier: username,
            password,
          });
          if (!sessionKey) {
            setError("Failed to register");
            return;
          }
          if (redirect) {
            router.navigate(redirect);
            return;
          }
          router.navigate("/");
        }}
        children={<Text>Register</Text>}
        isPending={isPending}
      />
      {error && (
        <View className="mt-4">
          <AlertCircle className="h-4 w-4" />
          {/* TODO proper styling */}
          <Text>Error</Text>
          <Text>Failed to register</Text>
        </View>
      )}
    </View>
  );
};

export default Register;
