import { FC } from 'react';

import { MdBoxListProps } from '../../contexts';
import { BlockElement } from '../../components';

export const List: FC<MdBoxListProps> = ({
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
