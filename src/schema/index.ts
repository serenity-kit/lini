import { DbSchema, makeSchema } from "@livestore/livestore";

import * as mutations from "./mutations.ts";

const workouts = DbSchema.table("workouts", {
  id: DbSchema.text({ primaryKey: true }),
  startedAt: DbSchema.text(),
});

const sequences = DbSchema.table("sequences", {
  id: DbSchema.text({ primaryKey: true }),
  workoutId: DbSchema.text(),
  position: DbSchema.text(),
});

const sets = DbSchema.table("sets", {
  id: DbSchema.text({ primaryKey: true }),
  exerciseId: DbSchema.text(),
  sequenceId: DbSchema.text(),
  position: DbSchema.text(),
  repetitions: DbSchema.integer(),
  weight: DbSchema.integer(),
  finished: DbSchema.boolean(),
});

const exercises = DbSchema.table("exercises", {
  id: DbSchema.text({ primaryKey: true }),
  name: DbSchema.text(),
});

const app = DbSchema.table(
  "app",
  {
    newExerciseId: DbSchema.text({ nullable: true }),
  },
  { isSingleton: true }
);

export type Workout = DbSchema.FromTable.RowDecoded<typeof workouts>;
export type Sequence = DbSchema.FromTable.RowDecoded<typeof sequences>;
export type Sets = DbSchema.FromTable.RowDecoded<typeof sets>;

export type AppState = DbSchema.FromTable.RowDecoded<typeof app>;

export const tables = { app, workouts, sequences, sets, exercises };

export const schema = makeSchema({ tables, mutations });

export * as mutations from "./mutations.ts";
