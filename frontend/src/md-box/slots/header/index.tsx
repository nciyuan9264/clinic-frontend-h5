import { FC } from 'react';

import { MdBoxHeaderProps } from '../../contexts';
import { BlockElement } from '../../components';

export const Header: FC<MdBoxHeaderProps> = ({
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
