import { Buffer } from 'buffer';

import { isUndefined } from 'lodash-es';

import { isElementType } from './utils';
import { INSERT_ELEMENT_SLOT_EXTENSION_NAME } from '../marked';
import { InsertedElementItem } from '../common';
import { RenderFunction } from '../../type';

export interface RenderInsertElement {
  insertedElements: InsertedElementItem[];
}

/**
 * 渲染自定义插入的元素
 * @param node html-react-parser解析的原始节点
 * @param options 选项
 */
export const renderInsertElement: RenderFunction<false, RenderInsertElement> = (
  node,
  options,
) => {
  const { insertedElements = [] } = options;

  if (!isElementType(node, 'span')) {
    return;
  }

  const type = node.attribs['data-type'];

  if (type !== INSERT_ELEMENT_SLOT_EXTENSION_NAME) {
    return;
  }

  const indexString = node.attribs['data-index'];
  const rawData = node.attribs['data-raw'];

  if (isUndefined(indexString)) {
    return;
  }

  const index = parseInt(indexString);

  if (index > insertedElements.length) {
    return;
  }

  return insertedElements[index]?.render(
    rawData && Buffer.from(rawData, 'base64').toString('utf-8'),
  );
};
