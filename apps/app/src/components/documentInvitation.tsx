import React, { useId } from "react";
import { Alert } from "react-native";
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

  return (
    <div>
      <Text>Invitation link</Text>
      <div className="flex gap-2 pt-2">
        <Input
          id={id}
          value={`${window.location.origin}/list-invitation/${documentInvitationQuery.data?.token}#key=${seed}`}
          readOnly
          className="w-72"
        />
        <Button
          disabled={createOrRefreshDocumentInvitationMutation.isPending}
          onPress={createAndSendInvitation}
        >
          <Text>Refresh</Text>
        </Button>
      </div>
    </div>
  );
};
