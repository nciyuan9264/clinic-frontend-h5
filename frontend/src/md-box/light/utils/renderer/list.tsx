import { isUndefined } from 'lodash-es';

import { isElementType, isTextType } from './utils';
import { RenderFunction } from '../../type';
import { createMdBoxSlots } from '../../../contexts';

const ComposedList = createMdBoxSlots('List');

export const renderList: RenderFunction = (node, { renderRest, parents }) => {
  if (!isElementType(node, 'ol', 'ul')) {
    return;
  }
  const className = node.children.every(
    (child) =>
      isTextType(child as any) ||
      (isElementType(child as any, 'li') &&
        !isUndefined((child  as any).children[0]) &&
        isElementType((child  as any).children[0] as any, 'input') &&
        (child  as any).children[0].attribs.type === 'checkbox'),
  )
    ? 'tasklist'
    : undefined;

  return (
    <ComposedList
      className={className}
      node={node}
      raw={node}
      parents={parents}
      renderRest={renderRest}
    />
  );
};
