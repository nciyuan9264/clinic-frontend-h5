import React, { ComponentType, FC, createContext, useContext } from 'react';

import { MdBoxSlots, MdBoxSlotsWithRequired } from './type';
import { createShallowedProvider } from '../../utils';

export * from './type';

const MdBoxSlotsInnerContext = createContext<MdBoxSlotsWithRequired | null>(
  null,
);

export const MdBoxSlotsInnerProvider = createShallowedProvider(
  MdBoxSlotsInnerContext,
);

export const useMdBoxSlots = () => {
  const context = useContext(MdBoxSlotsInnerContext);

  if (!context) {
    throw Error('[MdBox Internal Bugs] MdBoxSlotsInnerContext Required');
  }

  return context;
};

type MdBoxSlotsPropsType<T extends keyof MdBoxSlots> = Exclude<
  MdBoxSlotsWithRequired[T],
  null
> extends ComponentType<infer P>
  ? P
  : never;

export const createMdBoxSlots = <T extends keyof MdBoxSlots>(
  name: T,
  DefaultComponent?: ComponentType<MdBoxSlotsPropsType<T>>,
) => {
  const WrappedTarget: FC<MdBoxSlotsPropsType<T>> = (props) => {
    const Slots = useMdBoxSlots();
    const InnerTarget = Slots[name] ?? DefaultComponent;

    if (!InnerTarget) {
      return null;
    }

    // @ts-expect-error ignore
    return <InnerTarget {...props} />;
  };
  WrappedTarget.displayName = name;
  return WrappedTarget;
};
