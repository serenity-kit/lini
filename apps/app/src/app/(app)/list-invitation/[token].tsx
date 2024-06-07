import { router, useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";
import * as sodium from "react-native-libsodium";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { useLocker } from "../../../hooks/useLocker";
import { acceptInvitation } from "../../../utils/acceptInvitation";
import { getHashParameter } from "../../../utils/getHashParam";
import { getSessionKey } from "../../../utils/sessionKeyStorage";
import { trpc } from "../../../utils/trpc";

const Invitation: React.FC = () => {
  const acceptDocumentInvitationMutation =
    trpc.acceptDocumentInvitation.useMutation();
  const { token: rawToken } = useLocalSearchParams();
  const token = typeof rawToken === "string" ? rawToken : "";
  const key = getHashParameter("key");
  const locker = useLocker();

  const documentInvitationByTokenQuery =
    trpc.documentInvitationByToken.useQuery(token);

  const acceptInvitationAndSend = () => {
    if (!documentInvitationByTokenQuery.data) {
      Alert.alert("Invitation not found.");
      return;
    }

    const sessionKey = getSessionKey();
    if (!sessionKey) {
      Alert.alert("Session key not found.");
      return;
    }

    if (!key) {
      Alert.alert("Key is not available in the Invitation URL.");
      return;
    }

    console.log(
      "documentInvitationByTokenQuery",
      documentInvitationByTokenQuery
    );

    const { listKey } = acceptInvitation({
      ciphertext: documentInvitationByTokenQuery.data.ciphertext,
      nonce: documentInvitationByTokenQuery.data.nonce,
      seed: key,
      sessionKey: sodium.from_base64(sessionKey).slice(0, 32),
    });

    acceptDocumentInvitationMutation.mutate(
      { token },
      {
        onError: () => {
          alert("Failed to accept invitation. Please try again.");
        },
        onSuccess: (data) => {
          if (data?.documentId) {
            locker.addItem({
              type: "document",
              documentId: data.documentId,
              value: sodium.to_base64(listKey),
            });
            router.navigate({ pathname: `/list/${data.documentId}` });
          }
        },
      }
    );
  };

  return (
    <Card className="p-4">
      <p className="mb-4">Accept the invitation to this list.</p>
      <Button
        disabled={acceptDocumentInvitationMutation.isPending}
        onPress={acceptInvitationAndSend}
      >
        <Text>Accept Invitation</Text>
      </Button>
    </Card>
  );
};

export default Invitation;
