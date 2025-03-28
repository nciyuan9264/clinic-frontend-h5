import React, { FC } from 'react';

import { MdBoxStrongProps } from '../../contexts';

export const Strong: FC<MdBoxStrongProps> = ({
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
