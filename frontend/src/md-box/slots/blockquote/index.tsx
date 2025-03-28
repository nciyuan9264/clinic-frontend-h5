import { FC } from 'react';

import { MdBoxBlockquoteProps } from '../../contexts';
import { BlockElement } from '../../components';

export const Blockquote: FC<MdBoxBlockquoteProps> = ({
  className,
  style,
  node,
  children,
  renderRest,
}) => {
  return (
    <BlockElement
      className={className}
      style={style}
      node={node}
      renderRest={renderRest}
    >
      {children}
    </BlockElement>
  );
};
