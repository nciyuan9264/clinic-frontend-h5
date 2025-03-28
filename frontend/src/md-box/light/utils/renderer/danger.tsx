import React from 'react';

import { RenderFunction } from '../../type';

/**
 * 不渲染除了tag、text、root外的任意元素，防止style污染、script执行
 * @param node html-react-parser解析的原始节点
 */
export const renderDanger: RenderFunction<false> = (node) => {
  if (node.type === 'tag' || node.type === 'text' || node.type === 'root') {
    return;
  }
  return <></>;
};
