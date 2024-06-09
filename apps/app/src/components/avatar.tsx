import { View } from "react-native";
import { Text } from "~/components/ui/text";

type Props = { name: string };

export const Avatar: React.FC<Props> = ({ name }) => {
  return (
    <View className="bg-slate-100 border border-slate-200 w-10 h-10 rounded-full items-center justify-center">
      <Text>{name.substring(0, 2)}</Text>
    </View>
  );
};
