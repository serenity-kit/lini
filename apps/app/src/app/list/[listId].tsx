import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import sodium, { KeyPair } from "react-native-libsodium";
import { useYjsSync } from "secsync-react-yjs";
import * as Yjs from "yjs";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { X } from "~/lib/icons/X";
import { DocumentInvitation } from "../../components/documentInvitation";
import { SubtleInput } from "../../components/subtleInput";
import { UpdateDocumentNameForm } from "../../components/updateDocumentNameForm";
import { useLocker } from "../../hooks/useLocker";
import { useYArray } from "../../hooks/useYArray";
import { deserialize } from "../../utils/deserialize";
import {
  documentPendingChangesStorage,
  documentStorage,
} from "../../utils/documentStorage";
import { serialize } from "../../utils/serialize";

const websocketEndpoint =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:3030"
    : "wss://secsync.fly.dev";

type Props = {
  documentId: string;
};

const List: React.FC<Props> = () => {
  const { listId } = useLocalSearchParams();
  const documentId = typeof listId === "string" ? listId : "";

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

  const yTodos: Yjs.Array<string> = yDocRef.current.getArray("todos");
  const todos = useYArray(yTodos);
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
    <View className="py-4 gap-4">
      <DocumentInvitation documentId={documentId} documentKey={documentKey} />

      <UpdateDocumentNameForm
        documentId={documentId}
        documentKey={documentKey}
      />

      <View className="flex flex-row items-center gap-2 px-6">
        <Input
          placeholder="What needs to be done?"
          onChangeText={(value) => setNewTodoText(value)}
          value={newTodoText}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
        />
        <Button
          className="add"
          onPress={(event) => {
            event.preventDefault();
            yTodos.push([newTodoText]);
            setNewTodoText("");
          }}
        >
          <Text>Add</Text>
        </Button>
      </View>

      {todos.map((entry, index) => {
        return (
          <View
            key={`${index}-${entry}`}
            className="flex flex-row items-center gap-2 px-6"
          >
            <Checkbox
              checked
              onCheckedChange={() => {
                console.log("checked", index);
              }}
            />
            <SubtleInput value={entry} />
            <Button
              variant="ghost"
              size="icon"
              onPress={() => {
                yTodos.delete(index, 1);
              }}
            >
              <X width={14} height={14} />
            </Button>
          </View>
        );
      })}
    </View>
  );
};

export default List;
