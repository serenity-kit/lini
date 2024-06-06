import { router, useLocalSearchParams } from "expo-router";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { trpc } from "../../utils/trpc";

const Invitation: React.FC = () => {
  const acceptDocumentInvitationMutation =
    trpc.acceptDocumentInvitation.useMutation();
  const { token: rawToken } = useLocalSearchParams();
  const token = typeof rawToken === "string" ? rawToken : "";

  const acceptInvitation = () => {
    acceptDocumentInvitationMutation.mutate(
      { token },
      {
        onError: () => {
          alert("Failed to accept invitation. Please try again.");
        },
        onSuccess: (data) => {
          if (data?.documentId) {
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
        onPress={acceptInvitation}
      >
        <Text>Accept Invitation</Text>
      </Button>
    </Card>
  );
};

export default Invitation;
