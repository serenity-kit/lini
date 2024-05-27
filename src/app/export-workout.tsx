import { querySQL } from "@livestore/livestore";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import * as React from "react";
import { View } from "react-native";
import { Button } from "../components/ui/button.tsx";
import { Text } from "../components/ui/text.tsx";
import type {
  Sequence as SequenceType,
  Sets as SetsType,
} from "../schema/index.ts";
import { getExercisesById } from "../utils/getExerciseById/getExercisesById.ts";

export default function ExportWorkout() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const [text, setText] = React.useState("");

  const workoutSequencesQuery = querySQL<SequenceType[]>(
    "SELECT * FROM sequences WHERE workoutId = $workoutId ORDER BY position ASC",
    {
      bindValues: typeof workoutId === "string" ? { workoutId } : undefined,
    }
  );

  React.useEffect(() => {
    let sequences = workoutSequencesQuery.run();
    sequences = sequences.map((sequence) => {
      const sets = querySQL<SetsType[]>(
        "SELECT * FROM sets WHERE sequenceId = $sequenceId ORDER BY position ASC",
        { bindValues: { sequenceId: sequence.id } }
      ).run();
      return {
        ...sequence,
        sets: sets.map((set) => {
          return {
            ...set,
            exerciseName: getExercisesById(set.exerciseId)?.name,
          };
        }),
      };
    });

    let result = "";

    sequences.forEach((sequence) => {
      // @ts-expect-error
      sequence.sets.forEach((set) => {
        result += `${set.exerciseName} ${set.repetitions}x${set.weight}\n`;
      });
      result += "\n";
    });

    // setText(JSON.stringify(sequences, null, 2));
    setText(result);
  }, []);

  return (
    <View className="p-8">
      <Text>{text}</Text>
      <Button
        onPress={async () => {
          await Clipboard.setStringAsync(text);
          router.dismiss();
        }}
      >
        <Text>Copy Text</Text>
      </Button>
    </View>
  );
}
