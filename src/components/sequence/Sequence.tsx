import { querySQL } from "@livestore/livestore";
import { useQuery, useRow, useStore } from "@livestore/livestore/react";
import { Link, useFocusEffect } from "expo-router";
import * as React from "react";
import { useCallback } from "react";
import { Alert, View } from "react-native";
import { exercises } from "../../constants/exercises.json";
import type { Sets as SetsType } from "../../schema/index.ts";
import { mutations, tables } from "../../schema/index.ts";
import { getExercisesById } from "../../utils/getExerciseById/getExercisesById.ts";
import { getFirstExercise } from "../../utils/getFirstExercise/getFirstExercise.ts";
import { position } from "../../utils/position/position.ts";
import { uniqueId } from "../../utils/uniqueId/uniqueId.ts";
import { Button } from "../ui/button.tsx";
import { Checkbox } from "../ui/checkbox.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.tsx";
import { Icon } from "../ui/icon.tsx";
import { Input } from "../ui/input.tsx";
import { Separator } from "../ui/separator.tsx";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table.tsx";
import { Text } from "../ui/text.tsx";

type SequenceProps = {
  sequenceId: string;
};

export const Sequence: React.FC<SequenceProps> = ({ sequenceId }) => {
  const exerciseModalRef = React.useRef<string | null>(null);
  const setsQuery = querySQL<SetsType[]>(
    "SELECT * FROM sets WHERE sequenceId = $sequenceId ORDER BY position ASC",
    { bindValues: { sequenceId } }
  );

  const sets = useQuery(setsQuery);
  const { store } = useStore();
  const [{ newExerciseId }] = useRow(tables.app);
  const [open, setOpen] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      if (exerciseModalRef.current) {
        store.mutate(
          mutations.updateSetExerciseId({
            id: exerciseModalRef.current,
            exerciseId: newExerciseId ? newExerciseId : getFirstExercise().id,
          }),
          mutations.updateNewExerciseId({ newExerciseId: null })
        );
        exerciseModalRef.current = null;
      } else if (newExerciseId) {
        store.mutate(mutations.updateNewExerciseId({ newExerciseId: null }));
      }
    }, [newExerciseId])
  );

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    const newPosition = lastSet
      ? position.createBetween(lastSet.position)
      : position.createBetween();
    store.mutate(
      mutations.addSet({
        id: uniqueId(),
        sequenceId,
        // @ts-expect-error exercises[0] is always defined
        exerciseId: lastSet ? lastSet.exerciseId : exercises[0].id,
        position: newPosition,
        repetitions: lastSet ? lastSet.repetitions : 0,
        weight: lastSet ? lastSet.weight : 0,
        finished: false,
      })
    );
  };

  const updateSetWeight = ({ id, weight }: { id: string; weight: number }) => {
    store.mutate(mutations.updateSetWeight({ id, weight }));
  };

  const updateSetRepetitions = ({
    id,
    repetitions,
  }: {
    id: string;
    repetitions: number;
  }) => {
    store.mutate(mutations.updateSetRepetitions({ id, repetitions }));
  };

  const deleteSet = (id: string) => {
    store.mutate(mutations.deleteSet({ id }));
  };

  const deleteSequence = (id: string) => {
    store.mutate(mutations.deleteSequence({ id }));
  };

  const updateSetFinished = ({
    id,
    finished,
  }: {
    id: string;
    finished: boolean;
  }) => {
    store.mutate(mutations.updateSetFinished({ id, finished }));
  };

  return (
    <>
      <View className="mx-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: "44%" }}>
                <Text></Text>
              </TableHead>
              <TableHead style={{ width: "20%" }}>
                <Text>Weight</Text>
              </TableHead>
              <TableHead style={{ width: "20%" }}>
                <Text>Reps</Text>
              </TableHead>
              <TableHead style={{ width: "14%" }}>
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
                          "Are you sure you want to delete this series of sets?",
                          "",
                          [
                            { text: "Keep", style: "cancel" },
                            {
                              text: "Delete",
                              onPress: () => {
                                deleteSequence(sequenceId);
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Text className="color-red-500">Delete sets</Text>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {sets.map((set, index) => {
                      return (
                        <DropdownMenuItem
                          key={set.id}
                          onPress={() => {
                            Alert.alert(
                              "Are you sure you want to delete this set?",
                              `#${index + 1} / ${
                                getExercisesById(set.exerciseId)?.name
                              } / ${(
                                set.weight / 100
                              ).toString()} / ${set.repetitions.toString()}`,
                              [
                                {
                                  text: "Keep",
                                  style: "cancel",
                                },
                                {
                                  text: "Delete",
                                  onPress: () => {
                                    deleteSet(set.id);
                                  },
                                },
                              ]
                            );
                          }}
                        >
                          <Text className="color-red-500">
                            Delete set {index + 1}
                          </Text>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
            </TableRow>
          </TableHeader>
          <View>
            {sets.map((item) => {
              return (
                <TableRow className="border-0" key={item.id}>
                  <TableCell className="px-0" style={{ width: "44%" }}>
                    <Link
                      href="/choose-exercise"
                      onPress={() => {
                        exerciseModalRef.current = item.id;
                      }}
                      asChild
                    >
                      <Button variant="outline">
                        <Text>{getExercisesById(item.exerciseId)?.name}</Text>
                      </Button>
                    </Link>
                  </TableCell>

                  <TableCell className="w-1/5">
                    <Input
                      keyboardType="numeric"
                      value={(item.weight / 100).toString()}
                      onChangeText={(value) => {
                        updateSetWeight({
                          id: item.id,
                          weight: parseInt(value, 10) * 100 || item.weight,
                        });
                      }}
                      className="text-center"
                    />
                  </TableCell>

                  <TableCell className="w-1/5">
                    <Input
                      keyboardType="numeric"
                      value={item.repetitions.toString()}
                      onChangeText={(value) => {
                        updateSetRepetitions({
                          id: item.id,
                          repetitions: parseInt(value, 10) || item.repetitions,
                        });
                      }}
                      className="text-center"
                    />
                  </TableCell>

                  <TableCell
                    style={{ width: "16%" }}
                    className="flex justify-center items-center"
                  >
                    <Checkbox
                      checked={Boolean(item.finished)}
                      onCheckedChange={(checked) => {
                        updateSetFinished({
                          id: item.id,
                          finished: checked,
                        });
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </View>
        </Table>

        <Button variant="secondary" onPress={addSet} className="mt-4">
          <Text>Add Set</Text>
        </Button>
      </View>
      <Separator className="my-8 bg-transparent" />
    </>
  );
};
