import React, { useId } from "react";
import { Alert, View } from "react-native";
import * as sodium from "react-native-libsodium";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { createInvitation } from "../utils/createInvitation";
import { getSessionKey } from "../utils/sessionKeyStorage";
import { trpc } from "../utils/trpc";

type Props = {
  documentId: string;
  documentKey: Uint8Array;
};

export const DocumentInvitation: React.FC<Props> = ({
  documentId,
  documentKey,
}) => {
  const documentInvitationQuery = trpc.documentInvitation.useQuery(documentId);
  const createOrRefreshDocumentInvitationMutation =
    trpc.createOrRefreshDocumentInvitation.useMutation();
  const id = useId();
  const [seed, setSeed] = React.useState("");

  const createAndSendInvitation = () => {
    const sessionKey = getSessionKey();

    if (!sessionKey) {
      Alert.alert("Session key not found");
      return;
    }

    const { ciphertext, nonce, seed } = createInvitation({
      listKey: documentKey,
      // the key is much longer and we only need the first 32 bytes
      sessionKey: sodium.from_base64(sessionKey).slice(0, 32),
    });
    createOrRefreshDocumentInvitationMutation.mutate(
      { documentId, ciphertext, nonce },
      {
        onSuccess: () => {
          documentInvitationQuery.refetch();
          setSeed(seed);
        },
      }
    );
  };

  if (documentInvitationQuery.isLoading) {
    return null;
  }
  if (documentInvitationQuery.error) {
    return <Text>Couldn't load the Invitation</Text>;
  }

  return (
    <View className="flex flex-col gap-2">
      {documentInvitationQuery.data ? (
        <Text>
          You have one invitation link ({documentInvitationQuery.data.token})
          which is {documentInvitationQuery.data.isExpired ? "" : "not "}
          expired.
        </Text>
      ) : (
        <Text>No invitation link found</Text>
      )}

      <Button
        disabled={createOrRefreshDocumentInvitationMutation.isPending}
        onPress={createAndSendInvitation}
      >
        <Text>Create a new Invitation Link</Text>
      </Button>
      {seed && (
        <Input
          id={id}
          value={`${window.location.origin}/list-invitation/${documentInvitationQuery.data?.token}#key=${seed}`}
          readOnly
          multiline
          className="min-h-32"
        />
      )}
    </View>
  );
};
