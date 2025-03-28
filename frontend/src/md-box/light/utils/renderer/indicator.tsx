import React from 'react';

import { isElementType } from './utils';
import { RenderFunction } from '../../type';
import { createMdBoxSlots } from '../../../contexts';

const ComposedIndicator = createMdBoxSlots('Indicator');

export const renderIndicator: RenderFunction<false> = (node, options = {}) => {
  const { parents } = options;

  if (!isElementType(node, 'span') || node.attribs?.class !== 'indicator') {
    return;
  }

  return <ComposedIndicator raw={node} parents={parents} />;
};
