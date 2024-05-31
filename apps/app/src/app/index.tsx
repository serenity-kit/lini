import { Link } from "expo-router";
import * as React from "react";
import { Text } from "react-native";

const Lists: React.FC = () => {
  const workouts: { id: string; startedAt: string }[] = [];

  return (
    <Text>
      Hello WOrld <Link href="/list/wow">LIST A</Link>
    </Text>
  );
};

export default Lists;
