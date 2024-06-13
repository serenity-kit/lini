import { View } from "react-native";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Text } from "~/components/ui/text";
import { Users } from "~/lib/icons/Users";
import { trpc } from "../utils/trpc";
import { Avatar } from "./avatar";
import { DocumentInvitation } from "./documentInvitation";

type Props = {
  documentId: string;
  documentKey: Uint8Array;
  currentUserIsAdmin: boolean;
};

export const DocumentMembers: React.FC<Props> = ({
  documentId,
  documentKey,
  currentUserIsAdmin,
}) => {
  const documentMembersQuery = trpc.documentMembers.useQuery(documentId);
  const visibleUsers = documentMembersQuery.data
    ? documentMembersQuery.data.slice(0, 5)
    : [];
  const moreUsersCount = documentMembersQuery.data
    ? documentMembersQuery.data.length - visibleUsers.length
    : 0;
  const isPrivateNote = documentMembersQuery.data?.length === 1;

  return (
    <View className="flex flex-row">
      {isPrivateNote ? (
        <View className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 h-10 rounded-full items-center justify-center">
          <Text className="text-sm">Private</Text>
        </View>
      ) : (
        <View className="flex flex-row -space-x-3">
          {visibleUsers.map((user) => {
            return <Avatar key={user.id} name={user.username} />;
          })}
          {moreUsersCount !== 0 && (
            <View className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-10 h-10 rounded-full items-center justify-center">
              <Text>+{moreUsersCount}</Text>
            </View>
          )}
        </View>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button className="ml-2" variant="outline" size="icon">
            <Users className="text-gray-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-96">
          {currentUserIsAdmin ? (
            <>
              <DocumentInvitation
                documentId={documentId}
                documentKey={documentKey}
              />

              <View className="mb-4" />
            </>
          ) : null}
          <Text className="text-sm">Members</Text>
          <View className="pt-2 flex flex-col gap-2">
            {documentMembersQuery.data?.map((user) => {
              return (
                <View
                  key={user.id}
                  className="flex flex-row gap-4 items-center"
                >
                  <Avatar name={user.username} />
                  <Text>{user.username}</Text>
                  <Text>{user.isAdmin ? "(admin)" : ""}</Text>
                </View>
              );
            })}
          </View>
        </PopoverContent>
      </Popover>
    </View>
  );
};
