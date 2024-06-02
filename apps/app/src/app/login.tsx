import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { AlertCircle } from "~/lib/icons/AlertCircle";
import { AuthForm } from "../components/authForm";
import { useLocker } from "../hooks/useLocker";
import { useLogin } from "../hooks/useLogin";
import { deriveKey } from "../utils/deriveKey";

const Login = () => {
  const { login, isPending } = useLogin();
  const [error, setError] = useState<string | null>(null);
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { addItem } = useLocker();

  return (
    <View className="max-w-md mr-auto ml-auto">
      <AuthForm
        onSubmit={async ({ password, username }) => {
          const loginResult = await login({
            userIdentifier: username,
            password,
          });
          if (loginResult === null) {
            setError("Failed to login");
            return;
          }
          const lockerKey = deriveKey({
            context: "userLocker",
            key: loginResult.exportKey,
            subkeyId: "1D4xb6ADE6j67ZttH7cj7Q",
          });
          await addItem({ type: "lockerKey", value: lockerKey.key });

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
