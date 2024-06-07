import * as React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

const Home: React.FC = () => {
  return (
    <View className="flex flex-1 justify-center items-center">
      <Text className="text-4xl">Welcome 🤗</Text>
    </View>
  );
};

export default Home;
