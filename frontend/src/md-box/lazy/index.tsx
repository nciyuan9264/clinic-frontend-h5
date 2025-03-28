import { forwardRef } from 'react';

import { defaults, isBoolean } from 'lodash-es';

import {
  UseLazyComponentOptions,
  useLazyComponent,
  useLazyKatex,
} from './hooks';
import LightTex from '../slots/light-tex';
import LightCodeBlockHighlighter from '../slots/light-code-block-highlighter';
import { MdBoxLight, MdBoxLightController, MdBoxLightProps } from '../light';
import { MdBoxSlots } from '../contexts';

export type MdBoxLazyProps = MdBoxLightProps &
  Pick<UseLazyComponentOptions, 'retryInterval' | 'retryTimes'>;

export type MdBoxLazyController = MdBoxLightController;

export * from '../light';

export const MdBoxLazy = forwardRef<MdBoxLazyController, MdBoxLazyProps>(
  function MdBoxRenderFunction(
    {
      slots = {},
      autoFixSyntax = true,
      retryTimes = 5,
      retryInterval = 100,
      ...restProps
    },
    ref,
  ) {
    const lazyKatex = useLazyKatex();

    const LazyKatexTex = useLazyComponent(
      () => import('../slots/katex-tex'),
      LightTex,
      { retryTimes, retryInterval },
    );

    const LazyKatexMathJaxTex = useLazyComponent(
      () => import('../slots/katex-mathjax-tex'),
      LazyKatexTex,
      { retryTimes, retryInterval },
    );

    const LazyPrismCodeBlockHighlighter = useLazyComponent(
      () => import('../slots/prism-code-block-highlighter'),
      LightCodeBlockHighlighter,
      { retryTimes, retryInterval },
    );

    return (
      <MdBoxLight
        ref={ref}
        slots={defaults<MdBoxSlots, MdBoxSlots>(slots, {
          Tex: LazyKatexMathJaxTex,
          CodeBlockHighlighter: LazyPrismCodeBlockHighlighter,
        })}
        autoFixSyntax={
          autoFixSyntax && {
            katex: lazyKatex,
            ...(isBoolean(autoFixSyntax) ? {} : autoFixSyntax),
          }
        }
        {...restProps}
      />
    );
  },
);
