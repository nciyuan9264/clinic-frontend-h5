import { ComponentType, FC, Suspense } from 'react';

// eslint-disable-next-line @typescript-eslint/comma-dangle
export const withSuspense = <T,>(
  Target: ComponentType<T>,
  Fallback?: ComponentType<T>,
) => {
  const SuspensedTarget: FC<T> = (props: T) => {
    return (
      // @ts-expect-error ignore
      <Suspense fallback={Fallback && <Fallback {...props} />}>
        {
          // @ts-expect-error ignore
          <Target {...props} />
        }
      </Suspense>
    );
  };

  SuspensedTarget.displayName = Target.displayName ?? Fallback?.displayName;

  return SuspensedTarget;
};
