import { Snapshot as DbSnapshot, Update as DbUpdate } from "@prisma/client";
import { Snapshot, Update } from "secsync";

export function serializeSnapshot(snapshot: DbSnapshot): Snapshot {
  return {
    ...JSON.parse(snapshot.data),
  };
}

export function serializeUpdate(update: DbUpdate): Update {
  return {
    ...JSON.parse(update.data),
  };
}

export function serializeUpdates(updates: DbUpdate[]): Update[] {
  return updates.map((update) => {
    return serializeUpdate(update);
  });
}
