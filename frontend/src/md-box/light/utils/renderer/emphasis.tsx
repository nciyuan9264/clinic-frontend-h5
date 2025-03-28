import { isNull } from 'lodash-es';
import { domToReact } from 'html-react-parser';

import {
  detectIsChinese,
  getInnerText,
  isElementType,
  isTextType,
} from './utils';
import { RenderFunction } from '../../type';
import { createMdBoxSlots } from '../../../contexts';

const ComposedEmphasis = createMdBoxSlots('Emphasis');

/**
 * 渲染斜体元素
 * @param node html-react-parser解析的原始节点
 * @param options 选项
 */
export const renderEm: RenderFunction<
  true,
  {
    spacingAfterChineseEm?: boolean | number;
  }
> = (node, { renderRest, spacingAfterChineseEm, parents }) => {
  if (!isElementType(node, 'em')) {
    return;
  }

  const hasEmSpacing =
    spacingAfterChineseEm !== undefined &&
    spacingAfterChineseEm !== false &&
    detectIsChinese(getInnerText(node).slice(-1) ?? '') &&
    !isNull(node.nextSibling) &&
    (isElementType(node.nextSibling as any) || isTextType(node.nextSibling as any)) &&
    detectIsChinese(getInnerText(node.nextSibling as any).slice(0, 1) ?? '');

  const spacing =
    typeof spacingAfterChineseEm === 'boolean' ? 2 : spacingAfterChineseEm;

  return (
    <ComposedEmphasis
      style={{ marginRight: hasEmSpacing ? spacing : undefined }}
      node={node}
      raw={node}
      parents={parents}
    >
      {domToReact(node.children as any, {
        replace: renderRest,
      })}
    </ComposedEmphasis>
  );
};
