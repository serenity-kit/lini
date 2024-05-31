import { Schema } from "@effect/schema";
import * as S from "@effect/schema/Schema";

export const Exercise = Schema.struct({
  id: Schema.string,
  name: Schema.string,
  instructions: Schema.string,
});

export type Exercise = S.Schema.Type<typeof Exercise>;
