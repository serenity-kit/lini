import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import sodium, { KeyPair } from "react-native-libsodium";
import { generateId } from "secsync";
import { useYjsSync } from "secsync-react-yjs";
import * as Yjs from "yjs";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { X } from "~/lib/icons/X";
import { DocumentMembers } from "../../../components/documentMember";
import { SubtleInput } from "../../../components/subtleInput";
import { UpdateDocumentNameForm } from "../../../components/updateDocumentNameForm";
import { useLocker } from "../../../hooks/useLocker";
import { useYData } from "../../../hooks/useYData";
import { deserialize } from "../../../utils/deserialize";
import {
  documentPendingChangesStorage,
  documentStorage,
} from "../../../utils/documentStorage";
import { serialize } from "../../../utils/serialize";
import { trpc } from "../../../utils/trpc";

const websocketEndpoint =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:3030"
    : "wss://secsync.fly.dev";

type Props = {
  documentId: string;
};

type ChecklistItem = {
  text: string;
  checked: boolean;
};

const List: React.FC<Props> = () => {
  const { listId } = useLocalSearchParams();
  const documentId = typeof listId === "string" ? listId : "";
  const getDocumentQuery = trpc.getDocument.useQuery(documentId, {
    refetchInterval: 5000,
  });

  const [authorKeyPair] = useState<KeyPair>(() => {
    return sodium.crypto_sign_keypair();
  });

  // load initial data
  const [initialData] = useState(() => {
    const yDoc = new Yjs.Doc();
    // load full document
    const serializedDoc = documentStorage.getString(documentId);
    if (serializedDoc) {
      Yjs.applyUpdateV2(yDoc, deserialize(serializedDoc));
    }

    // loads the pendingChanges
    const pendingChanges = documentPendingChangesStorage.getString(documentId);

    return {
      yDoc,
      pendingChanges: pendingChanges ? deserialize(pendingChanges) : [],
    };
  });

  const yDocRef = useRef<Yjs.Doc>(initialData.yDoc);

  // update the document after every change (could be debounced)
  useEffect(() => {
    const onUpdate = (update: any) => {
      const fullYDoc = Yjs.encodeStateAsUpdateV2(yDocRef.current);
      documentStorage.set(documentId, serialize(fullYDoc));
    };
    yDocRef.current.on("updateV2", onUpdate);

    return () => {
      yDocRef.current.off("updateV2", onUpdate);
    };
  }, []);

  const yDocument: Yjs.Map<Yjs.Map<any>> = yDocRef.current.getMap("document");
  const document = useYData<{ [k: string]: ChecklistItem }>(yDocument);
  const [newTodoText, setNewTodoText] = useState("");

  const { content } = useLocker();
  const documentKey = sodium.from_base64(content[`document:${documentId}`]);

  const [state, send] = useYjsSync({
    yDoc: yDocRef.current,
    pendingChanges: initialData.pendingChanges,
    // callback to store the pending changes in
    onPendingChangesUpdated: (allChanges) => {
      documentPendingChangesStorage.set(documentId, serialize(allChanges));
    },
    documentId,
    signatureKeyPair: authorKeyPair,
    websocketEndpoint,
    websocketSessionKey: "your-secret-session-key",
    getNewSnapshotData: async ({ id }) => {
      return {
        data: Yjs.encodeStateAsUpdateV2(yDocRef.current),
        key: documentKey,
        publicData: {},
      };
    },
    getSnapshotKey: async () => {
      return documentKey;
    },
    shouldSendSnapshot: ({ snapshotUpdatesCount }) => {
      // create a new snapshot if the active snapshot has more than 100 updates
      return snapshotUpdatesCount > 100;
    },
    isValidClient: async (signingPublicKey: string) => {
      return true;
    },
    sodium,
    logging: "debug",
  });

  return (
    <View className="py-8 gap-4">
      <View className="flex flex-row gap-6 items-center justify-end pl-4 pr-6">
        <UpdateDocumentNameForm
          documentId={documentId}
          documentKey={documentKey}
        />
        <DocumentMembers
          documentId={documentId}
          documentKey={documentKey}
          currentUserIsAdmin={getDocumentQuery.data?.isAdmin || false}
        />
      </View>

      <View className="h-4" />

      <View className="flex flex-row items-center gap-2 px-6">
        <View className="flex flex-1">
          <Input
            placeholder="What needs to be done?"
            onChangeText={(value) => setNewTodoText(value)}
            value={newTodoText}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            numberOfLines={1}
          />
        </View>
        <Button
          className="add"
          onPress={(event) => {
            event.preventDefault();
            // @ts-expect-error sodium is not typed
            const id = generateId(sodium);
            const text = new Yjs.Text(newTodoText);
            const todo = new Yjs.Map<any>();
            todo.set("type", "checklist-item");
            todo.set("text", text);
            todo.set("checked", false);
            // TODO add position
            yDocument.set(id, todo);
            setNewTodoText("");
          }}
        >
          <Text>Add</Text>
        </Button>
      </View>

      {Object.keys(document || {}).map((id, index) => {
        if (document === null) return null;
        const entry = document[id];

        return (
          <View
            key={`${index}-${entry}`}
            className="flex flex-row items-center gap-2 px-6"
          >
            <Checkbox
              checked={entry.checked}
              onCheckedChange={() => {
                const yEntry = yDocument.get(id);
                if (yEntry) {
                  yEntry.set("checked", !entry.checked);
                }
              }}
            />
            <View className="flex flex-1">
              <SubtleInput
                placeholder="What needs to be done?"
                value={entry.text}
                numberOfLines={1}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                onChangeText={(newText) => {
                  const yEntry = yDocument.get(id);
                  if (yEntry) {
                    yEntry.set("text", newText);
                  }
                }}
              />
            </View>
            <Button
              variant="ghost"
              size="icon"
              onPress={() => {
                yDocument.delete(id);
              }}
            >
              <X width={14} height={14} className="text-red-700" />
            </Button>
          </View>
        );
      })}
    </View>
  );
};

export default List;
