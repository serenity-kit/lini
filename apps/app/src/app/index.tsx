import { Link } from "expo-router";
import * as React from "react";
import { Text } from "react-native";

const Lists: React.FC = () => {
  return (
    <Text>
      Hello WOrld{" "}
      <Link
        href={{
          pathname: "/list/[listId]",
          params: { listId: "wow" },
        }}
      >
        LIST A
      </Link>
      <Link href="/login">Login</Link>
      <Link href="/register">Register</Link>
    </Text>
  );
};

export default Lists;
