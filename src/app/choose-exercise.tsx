import { useStore } from "@livestore/livestore/react";
import { router } from "expo-router";
import * as React from "react";
import { FlatList } from "react-native";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import { Text } from "../components/ui/text";
import { exercises } from "../constants/exercises.json";
import { mutations } from "../schema";

const exercisesForSearch = exercises.map((exercise) => {
  return {
    ...exercise,
    filterName: exercise.name
      .toLocaleLowerCase()
      .replaceAll(" ", "")
      .replaceAll("-", ""),
  };
});

export default function Modal() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const filterSearchTerm = searchTerm
    .toLocaleLowerCase()
    .replaceAll(" ", "")
    .replaceAll("-", "");
  const filteredExercises = exercisesForSearch.filter((exercise) => {
    return exercise.filterName.includes(filterSearchTerm);
  });
  const { store } = useStore();

  const updateNewExerciseId = (newExerciseId: string) => {
    store.mutate(mutations.updateNewExerciseId({ newExerciseId }));
  };

  return (
    <>
      <Input
        placeholder="search exercises"
        value={searchTerm}
        onChangeText={setSearchTerm}
        className="m-4 mt-8"
        autoFocus
      />
      <Separator />
      <FlatList
        data={filteredExercises}
        renderItem={({ item }) => (
          <>
            <Button
              variant="ghost"
              key={item.id}
              onPress={() => {
                updateNewExerciseId(item.id);
                router.dismiss();
              }}
              className="items-start"
            >
              <Text>{item.name}</Text>
            </Button>
            <Separator />
          </>
        )}
        keyExtractor={(item) => item.id}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
      />
    </>
  );
}
