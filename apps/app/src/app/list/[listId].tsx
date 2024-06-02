import { useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { View } from "react-native";
import sodium, { KeyPair } from "react-native-libsodium";
import { useYjsSync } from "secsync-react-yjs";
import * as Yjs from "yjs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { useLocker } from "../../hooks/useLocker";
import { useYArray } from "../../hooks/useYArray";

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

  const yDocRef = useRef<Yjs.Doc>(new Yjs.Doc());
  const yTodos: Yjs.Array<string> = yDocRef.current.getArray("todos");
  const todos = useYArray(yTodos);
  const [newTodoText, setNewTodoText] = useState("");
  const { content } = useLocker();
  const documentKey = sodium.from_base64(content[`document:${documentId}`]);

  const [state, send] = useYjsSync({
    yDoc: yDocRef.current,
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
    <>
      <View>
        <View>
          <Input
            placeholder="What needs to be done?"
            onChangeText={(value) => setNewTodoText(value)}
            value={newTodoText}
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

        <View>
          {todos.map((entry, index) => {
            return (
              <View key={`${index}-${entry}`}>
                <View className="edit">
                  <Text>{entry}</Text>
                </View>
                <Button
                  className="destroy"
                  onPress={() => {
                    yTodos.delete(index, 1);
                  }}
                >
                  <Text>x</Text>
                </Button>
              </View>
            );
          })}
        </View>
      </View>
    </>
  );
};

export default List;
