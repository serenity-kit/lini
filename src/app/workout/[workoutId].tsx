import { querySQL } from "@livestore/livestore";
import { useQuery, useRow, useStore } from "@livestore/livestore/react";
import {
  Link,
  Stack,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import React, { useCallback } from "react";
import { Alert, FlatList, View } from "react-native";
import { Sequence } from "../../components/sequence/Sequence.tsx";
import { Button } from "../../components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu.tsx";
import { Icon } from "../../components/ui/icon.tsx";
import { Text } from "../../components/ui/text.tsx";
import {
  mutations,
  tables,
  type Sequence as SequenceType,
  type Workout as WorkoutType,
} from "../../schema/index.ts";
import { formatDatetimeString } from "../../utils/formatDatetimeString/formatDatetimeString.ts";
import { getFirstExercise } from "../../utils/getFirstExercise/getFirstExercise.ts";
import { position } from "../../utils/position/position.ts";
import { uniqueId } from "../../utils/uniqueId/uniqueId.ts";

export default function Workout() {
  const { workoutId } = useLocalSearchParams();
  const workoutQuery = querySQL<WorkoutType[]>(
    "SELECT * FROM workouts WHERE id = $workoutId LIMIT 1",
    {
      bindValues: typeof workoutId === "string" ? { workoutId } : undefined,
    }
  );
  const workoutSequencesQuery = querySQL<SequenceType[]>(
    "SELECT * FROM sequences WHERE workoutId = $workoutId ORDER BY position ASC",
    {
      bindValues: typeof workoutId === "string" ? { workoutId } : undefined,
    }
  );

  const exerciseModalRef = React.useRef(false);

  const { store } = useStore();
  const [{ newExerciseId }] = useRow(tables.app);
  const workoutResult = useQuery(workoutQuery);
  const sequences = useQuery(workoutSequencesQuery);
  const [workout] = workoutResult;
  const [open, setOpen] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      if (exerciseModalRef.current) {
        if (workout === undefined) {
          throw new Error("workout is not defined is null");
        }
        const lastSequence = sequences[sequences.length - 1];
        const sequenceId = uniqueId();

        store.mutate(
          mutations.updateNewExerciseId({ newExerciseId: null }),
          mutations.addSequence({
            id: sequenceId,
            workoutId: workout.id,
            position: lastSequence
              ? position.createBetween(lastSequence.position)
              : position.createBetween(),
          }),
          mutations.addSet({
            id: uniqueId(),
            sequenceId,
            exerciseId: newExerciseId ? newExerciseId : getFirstExercise().id,
            position: position.createBetween(),
            repetitions: 0,
            weight: 0,
            finished: false,
          })
        );
        exerciseModalRef.current = false;
      } else if (newExerciseId) {
        store.mutate(mutations.updateNewExerciseId({ newExerciseId: null }));
      }
    }, [newExerciseId])
  );

  const deleteWorkout = (id: string) => {
    store.mutate(mutations.deleteWorkout({ id }));
    router.replace("/");
  };

  if (!workout) {
    return <Text>Workout not found</Text>;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Workout",
          headerRight: () => {
            return (
              <DropdownMenu
                open={open}
                onOpenChange={(newVal) => {
                  setOpen(newVal);
                }}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="-m-3">
                    <Icon name="more-2-fill" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent insets={{ top: 0, right: 12 }}>
                  <DropdownMenuItem
                    onPress={() => {
                      Alert.alert(
                        "Are you sure you want to delete this workout?",
                        "",
                        [
                          { text: "Keep", style: "cancel" },
                          {
                            text: "Delete",
                            onPress: () => {
                              deleteWorkout(workout.id);
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Text className="color-red-500">Delete workout</Text>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        }}
      />

      <FlatList
        data={sequences}
        renderItem={({ item }) => <Sequence sequenceId={item.id} />}
        keyExtractor={(item) => item.id}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        ListHeaderComponent={() => {
          return (
            <View>
              <Text className="text-lg text-center mb-8 mt-12">
                {formatDatetimeString(workout.startedAt)}
              </Text>
            </View>
          );
        }}
        ListFooterComponent={() => {
          return (
            <View className="mb-16">
              <Link
                href="/choose-exercise"
                onPress={() => {
                  exerciseModalRef.current = true;
                }}
                asChild
              >
                <Button className="mx-4 mt-2 mb-4">
                  <Text>Add Exercise</Text>
                </Button>
              </Link>
              <Link
                href={{
                  pathname: "/export-workout",
                  params: { workoutId },
                }}
                asChild
              >
                <Button variant="outline" className="mx-4">
                  <Text>Export Workout</Text>
                </Button>
              </Link>
            </View>
          );
        }}
      />
    </>
  );
}
