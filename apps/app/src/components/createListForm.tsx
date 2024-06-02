import { router } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { trpc } from "../utils/trpc";

export const CreateListForm: React.FC = () => {
  const [name, setName] = useState("");
  const createDocumentMutation = trpc.createDocument.useMutation();

  return (
    <View className="flex justify-center items-center gap-4 py-4">
      <Input
        placeholder="List name"
        className="max-w-48"
        value={name}
        onChangeText={(value) => {
          setName(value);
        }}
      />
      <Button
        disabled={createDocumentMutation.isPending}
        onPress={() => {
          createDocumentMutation.mutate(
            { name },
            {
              onSuccess: ({ document }) => {
                router.navigate({
                  pathname: `/list/[documentId]`,
                  params: { documentId: document.id },
                });
                // documentsQuery.refetch(); // TODO
              },
              onError: () => {
                Alert.alert("Failed to create the list");
              },
            }
          );
        }}
      >
        <Text>Create List</Text>
      </Button>
    </View>
  );
};