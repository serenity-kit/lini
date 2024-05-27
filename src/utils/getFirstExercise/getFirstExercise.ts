import { exercises } from "../../constants/exercises.json";

import { Exercise } from "../../types";

export const getFirstExercise = () => {
  return exercises[0] as unknown as Exercise;
};
