import { domToReact, attributesToProps } from 'html-react-parser';
import cs from 'classnames';

import { isElementType } from './utils';
import { RenderFunction } from '../../type';
import { createMdBoxSlots } from '../../../contexts';
import { BlockElement } from '../../../components';

const ComposedParagraph = createMdBoxSlots('Paragraph');

export interface RenderParagraphOptions {
  forceBrInterSpacing?: boolean;
}

export const renderParagraph: RenderFunction<true, RenderParagraphOptions> = (
  node,
  { renderRest, forceBrInterSpacing, parents },
) => {
  if (!isElementType(node, 'p')) {
    return;
  }

  const { className, ...restProps } = attributesToProps(node.attribs);

  return (
    <BlockElement>
      {({ className: blockClassName }) => (
        <ComposedParagraph
          {...restProps}
          raw={node}
          parents={parents}
          className={cs(className, blockClassName)}
          forceBrInterSpacing={forceBrInterSpacing}
        >
          {domToReact(node.children as any, {
            replace: renderRest,
          })}
        </ComposedParagraph>
      )}
    </BlockElement>
  );
};
