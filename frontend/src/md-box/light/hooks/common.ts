import { MutableRefObject, useReducer, useRef, useCallback } from 'react';

import { useLatest } from 'ahooks';

export const useEstablished = (condition: boolean) => {
  const establishedRef = useRef(condition);

  establishedRef.current = establishedRef.current || condition;

  return establishedRef.current;
};

export const usePreviousRef = <T>(
  value: T,
): MutableRefObject<T | undefined> => {
  const previousRef = useRef<T>();

  const currentRef = useRef(value);

  if (currentRef.current !== value) {
    previousRef.current = currentRef.current;
    currentRef.current = value;
  }

  return previousRef;
};

export const useForceUpdate = () => {
  const [, dispatcher] = useReducer((prev) => prev + 1, 0);

  return dispatcher;
};

type FunctionType<P extends Array<unknown>, R> = (...params: P) => R;

export function useLatestFunction<P extends Array<unknown>, R>(
  target: FunctionType<P, R>,
): FunctionType<P, R>;
export function useLatestFunction<P extends Array<unknown>, R>(
  target: FunctionType<P, R> | undefined,
): FunctionType<P, R> | undefined;
export function useLatestFunction<P extends Array<unknown>, R>(
  target: FunctionType<P, R> | undefined,
): FunctionType<P, R> | undefined {
  const targetRef = useLatest(target);

  const memoedFunction: FunctionType<P, R> = useCallback((...params) => {
    return targetRef.current?.(...params) as R;
  }, []);

  return target && memoedFunction;
}
