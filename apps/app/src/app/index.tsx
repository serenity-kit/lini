import { Link } from "expo-router";
import * as React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { trpc } from "../utils/trpc";

const Lists: React.FC = () => {
  const meQuery = trpc.me.useQuery(undefined, {
    // avoid lot's of retries in case of unauthorized blocking a page load
    retry: (failureCount, error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        return false;
      }
      if (failureCount > 3) return false;
      return true;
    },
  });

  return (
    <View>
      <Link
        href={{
          pathname: "/list/[listId]",
          params: { listId: "wow" },
        }}
      >
        LIST A
      </Link>
      <Link href="/login">
        <Text>Login</Text>
      </Link>
      <Link href="/register">Register</Link>

      <View>
        <Text>{meQuery.data?.username}</Text>
      </View>
    </View>
  );
};

export default Lists;
