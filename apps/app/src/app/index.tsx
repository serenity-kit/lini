import { Link } from "expo-router";
import * as React from "react";
import { View } from "react-native";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { CreateListForm } from "../components/createListForm";
import { Logout } from "../components/logout";
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

  const documentsQuery = trpc.documents.useQuery(undefined, {
    refetchInterval: 5000,
  });

  return (
    <View>
      <Link href="/login">
        <Text>Login</Text>
      </Link>
      <Link href="/register">Register</Link>

      <View>
        <Text>{meQuery.data?.username}</Text>
      </View>

      <Logout />

      <CreateListForm />

      <div className="flex flex-col gap-2 pt-4">
        {documentsQuery.data?.map((doc) => (
          <Link href={`/list/${doc.id}`} key={doc.id}>
            <Card className="flex flex-col items-start gap-2 rounded-lg border p-5 text-left text-xl transition-all hover:bg-accent">
              {doc.name}
            </Card>
          </Link>
        ))}
      </div>
    </View>
  );
};

export default Lists;
