import React from 'react';

import { domToReact } from 'html-react-parser';

import { isElementType } from './utils';
import { RenderFunction } from '../../type';
import { createMdBoxSlots } from '../../../contexts';

const ComposedStrong = createMdBoxSlots('Strong');

/**
 * 渲染加粗元素
 * @param node html-react-parser解析的原始节点
 * @param options 选项
 */
export const renderStrong: RenderFunction<true> = (
  node,
  { renderRest, parents },
) => {
  if (!isElementType(node, 'strong')) {
    return;
  }

  return (
    <ComposedStrong node={node} raw={node} parents={parents}>
      {domToReact(node.children, {
        replace: renderRest,
      })}
    </ComposedStrong>
  );
};
