import React from 'react';

import { Buffer } from 'buffer';

import { isElementType } from './utils';
import {
  BLOCK_MATH_SPAN_DATA_TYPE,
  INLINE_MATH_SPAN_DATA_TYPE,
} from '../common';
import { RenderFunction } from '../../type';
import { createMdBoxSlots } from '../../../contexts';

const ComposedTex = createMdBoxSlots('Tex');

export const renderMath: RenderFunction<false> = (node, options = {}) => {
  const { parents } = options;

  if (!isElementType(node, 'span')) {
    return;
  }

  const type = node.attribs['data-type'];

  const value = node.attribs['data-value'];

  if (!value) {
    return;
  }

  try {
    const tex = Buffer.from(value, 'base64').toString('utf8').trim();

    /** 目前设置行内公式和块公式一样的样式，防止块公式后面无法紧跟打字机指示器 */
    if (type === BLOCK_MATH_SPAN_DATA_TYPE) {
      return (
        <ComposedTex raw={node} parents={parents} tex={tex} mode="display" />
      );
    } else if (type === INLINE_MATH_SPAN_DATA_TYPE) {
      return (
        <ComposedTex raw={node} parents={parents} tex={tex} mode="inline" />
      );
    }
  } catch (error) {
    console.error('[Math Render Error]', error);
    return;
  }
};
