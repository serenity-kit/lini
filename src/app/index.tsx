import { Link } from "expo-router";
import * as React from "react";
import { FlatList, Pressable, View } from "react-native";
import { Button } from "../components/ui/button.tsx";
import { Card } from "../components/ui/card.tsx";
import { Text } from "../components/ui/text.tsx";
import { formatDatetimeString } from "../utils/formatDatetimeString/formatDatetimeString.ts";

const gap = 16;

const Workouts: React.FC = () => {
  const workouts: { id: string; startedAt: string }[] = [];

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
        onPress={() => {}}
        className="absolute bottom-0 mb-16 self-center"
      >
        <Text>Start Workout</Text>
      </Button>
    </>
  );
};

export default Workouts;
