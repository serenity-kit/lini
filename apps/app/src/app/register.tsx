import { Link, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { AlertCircle } from "~/lib/icons/AlertCircle";
import { AuthForm } from "../components/authForm";
import { useRegisterAndLogin } from "../hooks/useRegisterAndLogin";
import { setLockerKey } from "../locker/lockerKeyStorage";
import { deriveKey } from "../utils/deriveKey";
import { setSessionKey } from "../utils/sessionKeyStorage";

const Register = () => {
  const { registerAndLogin, isPending } = useRegisterAndLogin();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const [error, setError] = useState<string | null>(null);

  return (
    <View className="max-w-md mr-auto ml-auto min-w-80 mt-32">
      <AuthForm
        onSubmit={async ({ password, username }) => {
          const result = await registerAndLogin({
            userIdentifier: username,
            password,
          });
          if (!result) {
            setError("Failed to register");
            return;
          }
          const lockerKey = deriveKey({
            context: "userLocker",
            key: result.exportKey,
            subkeyId: "1D4xb6ADE6j67ZttH7cj7Q",
          });
          setSessionKey(result.sessionKey);
          setLockerKey(lockerKey.key);

          if (redirect) {
            router.navigate(redirect);
            return;
          }
          router.navigate("/");
        }}
        children="Sign up"
        isPending={isPending}
      />
      {error && (
        <View className="mt-4">
          <View className="flex flex-row items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {/* TODO proper styling */}
            <Text>Error</Text>
          </View>
          <Text>Failed to sign up</Text>
        </View>
      )}

      <View className="mt-8 text-center">
        <Link href="/login" className="text-center">
          Login here
        </Link>
      </View>
    </View>
  );
};

export default Register;
