import { useState } from "react";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

type Props = {
  onSubmit: (params: { username: string; password: string }) => void;
  isPending: boolean;
  children: React.ReactNode;
};

export const AuthForm = ({ onSubmit, isPending, children }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View>
      <Text className="text-xl text-center font-semibold mb-8 mt-12">
        {children}
      </Text>

      <View className="gap-4 flex flex-col">
        <Input
          // required TODO
          className="border border-slate-300 p-2 rounded"
          placeholder="Username"
          autoComplete="off"
          value={username}
          onChangeText={(value) => {
            setUsername(value);
          }}
        />

        <Input
          // required
          className="border border-slate-300 p-2 rounded"
          placeholder="Password"
          autoComplete="off"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
          }}
        />

        <Button
          disabled={isPending}
          onPress={() => {
            onSubmit({ username, password });
          }}
        >
          {children}
        </Button>
      </View>
    </View>
  );
};
