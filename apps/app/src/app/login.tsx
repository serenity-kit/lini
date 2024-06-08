import { Link, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { AlertCircle } from "~/lib/icons/AlertCircle";
import { AuthForm } from "../components/authForm";
import { useLocker } from "../hooks/useLocker";
import { useLogin } from "../hooks/useLogin";
import { deriveKey } from "../utils/deriveKey";
import { setSessionKey } from "../utils/sessionKeyStorage";

const Login = () => {
  const { login, isPending } = useLogin();
  const [error, setError] = useState<string | null>(null);
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { addItem } = useLocker();

  return (
    <View className="max-w-md mr-auto ml-auto min-w-80 mt-32">
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
          setSessionKey(loginResult.sessionKey);
          await addItem({ type: "lockerKey", value: lockerKey.key });

          if (redirect) {
            router.navigate(redirect);
            return;
          }
          router.navigate("/");
        }}
        children="Login"
        isPending={isPending}
      />

      {error && (
        <View className="mt-4">
          <View className="flex flex-row items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {/* TODO proper styling */}
            <Text>Error</Text>
          </View>
          <Text>Failed to log in</Text>
        </View>
      )}

      <View className="mt-8 text-center">
        <Link href="/register" className="text-center">
          Sign up here
        </Link>
      </View>
    </View>
  );
};

export default Login;
