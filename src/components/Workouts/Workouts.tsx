import { querySQL } from "@livestore/livestore";
import { useQuery, useStore } from "@livestore/livestore/react";
import { Link } from "expo-router";
import * as React from "react";
import { FlatList } from "react-native";
import type { Workout as WorkoutType } from "../../schema/index.ts";
import { mutations } from "../../schema/index.ts";
import { uniqueId } from "../../utils/uniqueId/uniqueId.ts";
import { Button } from "../ui/button.tsx";
import { Text } from "../ui/text.tsx";

const workoutsQuery = querySQL<WorkoutType[]>("SELECT * FROM workouts");

export const Workouts: React.FC = () => {
  const workouts = useQuery(workoutsQuery);
  const { store } = useStore();

  const addWorkout = () =>
    store.mutate(
      mutations.addWorkout({
        id: uniqueId(),
        startedAt: new Date().toISOString(),
      })
    );

  return (
    <>
      <Button onPress={addWorkout}>
        <Text>Add Workout</Text>
      </Button>
      <FlatList
        data={workouts}
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: "/workout/[workoutId]",
              params: { workoutId: item.id },
            }}
          >
            {item.startedAt}
          </Link>
        )}
        keyExtractor={(item) => item.id}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
      />
    </>
  );
};
