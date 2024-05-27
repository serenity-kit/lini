import { exercises } from "../../constants/exercises.json";
import { Exercise } from "../../types";

export const getExercisesById = (id: string) => {
  return exercises.find((exercise) => exercise.id === id) as
    | Exercise
    | undefined;
};
