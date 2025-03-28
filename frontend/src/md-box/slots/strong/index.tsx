import React from 'react';

import { MdBoxStrongProps } from '../../contexts';

export const Strong: React.FC<MdBoxStrongProps> = ({
  className,
  style,
  children,
}) => {
  return (
    <strong className={className} style={style}>
      {children}
    </strong>
  );
};
