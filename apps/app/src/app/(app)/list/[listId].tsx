import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import sodium from "react-native-libsodium";
import { Text } from "~/components/ui/text";
import Document from "../../../components/document";
import { useLocker } from "../../../hooks/useLocker";

const List: React.FC = () => {
  const { listId } = useLocalSearchParams();
  const documentId = typeof listId === "string" ? listId : null;

  const { content } = useLocker();

  if (!documentId) {
    return (
      <View>
        <Text>Document not found</Text>
      </View>
    );
  }

  const documentKeyBase64 = content[`document:${documentId}`];

  if (!documentKeyBase64) {
    return (
      <View>
        <Text>Loading document key …</Text>
      </View>
    );
  }

  const documentKey = sodium.from_base64(documentKeyBase64);

  return <Document documentId={documentId} documentKey={documentKey} />;
};

export default List;
