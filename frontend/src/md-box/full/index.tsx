import React, { forwardRef } from 'react';

import { defaults, isBoolean } from 'lodash-es';
import katex from 'katex';

import { PrismCodeBlockHighlighter } from '../slots/prism-code-block-highlighter';
import { MathJaxTex } from '../slots/mathjax-tex';
import { MdBoxLight, MdBoxLightController, MdBoxLightProps } from '../light';
import { MdBoxSlots } from '../contexts';

export type MdBoxProps = MdBoxLightProps;

export type MdBoxController = MdBoxLightController;

export * from '../light';

export const MdBox = forwardRef<MdBoxController, MdBoxProps>(
  function MdBoxRenderFunction(
    { slots = {}, autoFixSyntax = true, ...restProps },
    ref,
  ) {
    return (
      <MdBoxLight
        ref={ref}
        slots={defaults<MdBoxSlots, MdBoxSlots>(slots, {
          Tex: MathJaxTex,
          CodeBlockHighlighter: PrismCodeBlockHighlighter,
        })}
        autoFixSyntax={
          autoFixSyntax && {
            katex,
            ...(isBoolean(autoFixSyntax) ? {} : autoFixSyntax),
          }
        }
        {...restProps}
      />
    );
  },
);
