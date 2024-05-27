import { Schema } from "@effect/schema";
import { defineMutation, sql } from "@livestore/livestore";

export const addWorkout = defineMutation(
  "addWorkout",
  Schema.struct({ id: Schema.string, startedAt: Schema.string }),
  sql`INSERT INTO workouts (id, startedAt) VALUES ($id, $startedAt)`
);

export const deleteWorkout = defineMutation(
  "deleteWorkout",
  Schema.struct({ id: Schema.string }),
  sql`DELETE FROM workouts WHERE id = $id`
);

const Sequence = Schema.struct({
  id: Schema.string,
  workoutId: Schema.string,
  position: Schema.string,
});

export const addSequence = defineMutation(
  "addSequence",
  Sequence,
  sql`INSERT INTO sequences (id, workoutId, position) VALUES ($id, $workoutId, $position)`
);

export const deleteSequence = defineMutation(
  "deleteSequence",
  Schema.struct({ id: Schema.string }),
  sql`DELETE FROM sequences WHERE id = $id`
);

export const addSet = defineMutation(
  "addSet",
  Schema.struct({
    id: Schema.string,
    exerciseId: Schema.string,
    sequenceId: Schema.string,
    position: Schema.string,
    repetitions: Schema.number,
    weight: Schema.number,
    finished: Schema.boolean,
  }),
  sql`INSERT INTO sets (id, exerciseId, sequenceId, position, repetitions, weight, finished) VALUES ($id, $exerciseId, $sequenceId, $position, $repetitions, $weight, $finished)`
);

export const deleteSet = defineMutation(
  "deleteSet",
  Schema.struct({ id: Schema.string }),
  sql`DELETE FROM sets WHERE id = $id`
);

export const updateSetWeight = defineMutation(
  "updateSetWeight",
  Schema.struct({ id: Schema.string, weight: Schema.number }),
  sql`UPDATE sets SET weight = $weight WHERE id = $id`
);

export const updateSetRepetitions = defineMutation(
  "updateSetRepetitions",
  Schema.struct({ id: Schema.string, repetitions: Schema.number }),
  sql`UPDATE sets SET repetitions = $repetitions WHERE id = $id`
);

export const updateSetFinished = defineMutation(
  "updateSetFinished",
  Schema.struct({ id: Schema.string, finished: Schema.boolean }),
  sql`UPDATE sets SET finished = $finished WHERE id = $id`
);

export const updateSetExerciseId = defineMutation(
  "updateSetExerciseId",
  Schema.struct({ id: Schema.string, exerciseId: Schema.string }),
  sql`UPDATE sets SET exerciseId = $exerciseId WHERE id = $id`
);

export const updateNewExerciseId = defineMutation(
  "updateNewExerciseId",
  Schema.struct({ newExerciseId: Schema.union(Schema.null, Schema.string) }),
  sql`UPDATE app SET newExerciseId = $newExerciseId`
);

// finishWorkout
// startWorkout
// discardCurrentWorkout
