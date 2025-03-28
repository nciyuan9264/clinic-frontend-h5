import { FC } from 'react';

import { MdBoxEmphasisProps } from '../../contexts';

export const Emphasis: FC<MdBoxEmphasisProps> = ({
  className,
  style,
  children,
}) => {
  return (
    <em className={className} style={style}>
      {children}
    </em>
  );
};
