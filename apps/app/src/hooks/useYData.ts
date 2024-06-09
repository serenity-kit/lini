import { useRef, useSyncExternalStore } from "react";
import * as Yjs from "yjs";

export function useYData<Type>(yData: Yjs.Map<any>) {
  const cachedDataRef = useRef<Type | null>(null);
  const array = useSyncExternalStore(
    (callback) => {
      yData.observeDeep(callback);
      return () => yData.unobserveDeep(callback);
    },
    () => {
      // React requires reference equality
      const newStructure = yData.toJSON() as Type;
      if (
        JSON.stringify(cachedDataRef.current) === JSON.stringify(newStructure)
      ) {
        return cachedDataRef.current;
      } else {
        cachedDataRef.current = newStructure;
        return cachedDataRef.current;
      }
    },
    () => null
  );
  return array;
}
