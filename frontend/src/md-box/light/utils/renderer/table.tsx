import { attributesToProps, domToReact } from 'html-react-parser';
import cs from 'classnames';

import { isElementType } from './utils';
import { RenderFunction } from '../../type';
import { createMdBoxSlots } from '../../../contexts';
import { BlockElement } from '../../../components';

const ComposedTable = createMdBoxSlots('Table');

export const renderTable: RenderFunction = (node, { renderRest, parents }) => {
  if (!isElementType(node, 'table')) {
    return;
  }

  const { className, ...restProps } = attributesToProps(node.attribs);

  return (
    <BlockElement>
      {({ className: blockClassName }) => (
        <ComposedTable
          {...restProps}
          raw={node}
          parents={parents}
          className={cs(className, blockClassName)}
        >
          {domToReact((node as any).children, {
            replace: renderRest,
          })}
        </ComposedTable>
      )}
    </BlockElement>
  );
};
