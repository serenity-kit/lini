import React, { useId } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { trpc } from "../utils/trpc";

type Props = {
  documentId: string;
};

export const DocumentInvitation: React.FC<Props> = ({ documentId }) => {
  const documentInvitationQuery = trpc.documentInvitation.useQuery(documentId);
  const createOrRefreshDocumentInvitationMutation =
    trpc.createOrRefreshDocumentInvitation.useMutation();
  const id = useId();

  return (
    <div>
      <Text>Invitation link</Text>
      <div className="flex gap-2 pt-2">
        <Input
          id={id}
          value={`${window.location.origin}/list-invitation/${documentInvitationQuery.data?.token}`}
          readOnly
          className="w-72"
        />
        <Button
          disabled={createOrRefreshDocumentInvitationMutation.isPending}
          onPress={() =>
            createOrRefreshDocumentInvitationMutation.mutate(
              { documentId },
              {
                onSuccess: () => {
                  documentInvitationQuery.refetch();
                },
              }
            )
          }
        >
          <Text>Refresh</Text>
        </Button>
      </div>
    </div>
  );
};
