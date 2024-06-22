import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import sodium, { KeyPair } from "react-native-libsodium";
import { useY } from "react-yjs";
import { generateId } from "secsync";
import { useYjsSync } from "secsync-react-yjs";
import * as Yjs from "yjs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { X } from "~/lib/icons/X";
import { Checkbox } from "../components/checkbox";
import { DocumentMembers } from "../components/documentMember";
import { SubtleInput } from "../components/subtleInput";
import { UpdateDocumentNameForm } from "../components/updateDocumentNameForm";
import { convertChecklistToArrayAndSort } from "../utils/convertChecklistToArrayAndSort";
import { deserialize } from "../utils/deserialize";
import { getDocumentStorage } from "../utils/documentStorage";
import { position } from "../utils/position";
import { serialize } from "../utils/serialize";
import { trpc } from "../utils/trpc";

const websocketEndpoint = process.env.EXPO_PUBLIC_SECSYNC_WS_ENDPOINT as string;

type Props = {
  documentId: string;
  documentKey: Uint8Array;
};

const Document: React.FC<Props> = ({ documentKey, documentId }) => {
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
    const serializedDoc =
      getDocumentStorage().documentStorage.getString(documentId);
    if (serializedDoc) {
      Yjs.applyUpdateV2(yDoc, deserialize(serializedDoc));
    }

    // loads the pendingChanges
    const pendingChanges =
      getDocumentStorage().documentPendingChangesStorage.getString(documentId);

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
      getDocumentStorage().documentStorage.set(documentId, serialize(fullYDoc));
    };
    yDocRef.current.on("updateV2", onUpdate);

    return () => {
      yDocRef.current.off("updateV2", onUpdate);
    };
  }, []);

  const yDocument: Yjs.Map<Yjs.Map<any>> = yDocRef.current.getMap("document");
  const document = useY(yDocument);
  const checklist = document ? convertChecklistToArrayAndSort(document) : [];
  const [newTodoText, setNewTodoText] = useState("");

  const [state, send] = useYjsSync({
    yDoc: yDocRef.current,
    pendingChanges: initialData.pendingChanges,
    // callback to store the pending changes in
    onPendingChangesUpdated: (allChanges) => {
      getDocumentStorage().documentPendingChangesStorage.set(
        documentId,
        serialize(allChanges)
      );
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

  const addChecklistItem = (event: any) => {
    event.preventDefault();
    // @ts-expect-error sodium is not typed
    const id = generateId(sodium);
    const text = new Yjs.Text(newTodoText);
    const todo = new Yjs.Map<any>();
    const newPosition =
      checklist.length > 0
        ? position.createBetween(undefined, checklist[0].position)
        : position.createBetween();
    todo.set("type", "checklist-item");
    todo.set("text", text);
    todo.set("checked", false);
    todo.set("position", newPosition);

    yDocument.set(id, todo);
    setNewTodoText("");
  };

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
            onSubmitEditing={addChecklistItem}
          />
        </View>
        <Button className="add" onPress={addChecklistItem}>
          <Text>Add</Text>
        </Button>
      </View>

      {checklist.map((entry, index) => {
        return (
          <View
            key={`${index}-${entry}`}
            className="flex flex-row items-center gap-2 px-6"
          >
            <Checkbox
              checked={entry.checked}
              onCheckedChange={() => {
                const yEntry = yDocument.get(entry.id);
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
                  const yEntry = yDocument.get(entry.id);
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
                yDocument.delete(entry.id);
              }}
            >
              <X width={16} height={16} className="text-red-700" />
            </Button>
          </View>
        );
      })}
    </View>
  );
};

export default Document;
