import { querySQL } from "@livestore/livestore";
import { useQuery, useStore } from "@livestore/livestore/react";
import { Link, router } from "expo-router";
import * as React from "react";
import { FlatList, Pressable, View } from "react-native";
import { Button } from "../components/ui/button.tsx";
import { Card } from "../components/ui/card.tsx";
import { Text } from "../components/ui/text.tsx";
import type { Workout as WorkoutType } from "../schema/index.ts";
import { mutations } from "../schema/index.ts";
import { formatDatetimeString } from "../utils/formatDatetimeString/formatDatetimeString.ts";
import { uniqueId } from "../utils/uniqueId/uniqueId.ts";

const gap = 16;

const workoutsQuery = querySQL<WorkoutType[]>(
  "SELECT * FROM workouts ORDER BY startedAt DESC"
);

const Workouts: React.FC = () => {
  const workouts = useQuery(workoutsQuery);
  const { store } = useStore();

  const addWorkout = () => {
    const workoutId = uniqueId();
    store.mutate(
      mutations.addWorkout({
        id: workoutId,
        startedAt: new Date().toISOString(),
      })
    );
    router.push({
      pathname: "/workout/[workoutId]",
      params: { workoutId },
    });
  };

  return (
    <>
      <FlatList
        className="py-8 px-4"
        data={workouts}
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: "/workout/[workoutId]",
              params: { workoutId: item.id },
            }}
            asChild
          >
            <Pressable>
              <Card>
                <View className="flex justify-center p-6">
                  <Text className="text-xl">
                    {formatDatetimeString(item.startedAt)}
                  </Text>
                </View>
              </Card>
            </Pressable>
          </Link>
        )}
        keyExtractor={(item) => item.id}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        contentContainerStyle={{ gap }}
      />
      <Button
        size="lg"
        onPress={addWorkout}
        className="absolute bottom-0 mb-16 self-center"
      >
        <Text>Start Workout</Text>
      </Button>
    </>
  );
};

export default Workouts;
