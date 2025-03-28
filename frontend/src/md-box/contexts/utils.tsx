import React, { Context, FC, PropsWithChildren, useMemo } from 'react';

import { shallowEqual } from 'shallow-equal';

import { useCustomMemoValue, Comparable } from '../utils';

export const createShallowedProvider = <T extends Comparable>(
  context: Context<T>,
) => {
  const ContextProvider = context.Provider;

  const TargetProvider: FC<
    PropsWithChildren<{
      value: T;
      afterMemoedProcess?: (value: T) => T;
    }>
  > = ({ value, afterMemoedProcess, children }) => {
    const memoedValue = useCustomMemoValue(value, shallowEqual);

    const processedMemoedValue = useMemo(() => {
      if (afterMemoedProcess) {
        return afterMemoedProcess(memoedValue);
      }
      return memoedValue;
    }, [memoedValue]);

    return (
      <ContextProvider value={processedMemoedValue}>{children}</ContextProvider>
    );
  };

  return TargetProvider;
};
