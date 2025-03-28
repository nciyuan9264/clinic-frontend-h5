import { DependencyList, useMemo, useRef } from 'react';

import { isUndefined, isEqual } from 'lodash-es';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Comparable = Record<string, any> | any[] | null | undefined;

export const useCustomMemoValue = <T extends Comparable>(
  value: T,
  compareFn: (a: T, b: T) => boolean,
) => {
  const currentValue = useRef(value);

  if (!compareFn(value, currentValue.current)) {
    currentValue.current = value;
  }

  return currentValue.current;
};

export const useDeepCompareMemo = <T>(
  factory: () => T,
  deps: DependencyList,
) => {
  const dependencies = useRef<DependencyList>();

  if (
    isUndefined(dependencies.current) ||
    !isEqual(dependencies.current, deps)
  ) {
    dependencies.current = deps;
  }

  return useMemo(factory, dependencies.current);
};

export const useComputeValue = <T>(func: () => T): T => {
  return func();
};
