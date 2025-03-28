import { FC } from 'react';

import { MdBox, MdBoxProps } from '../../full';

export const MdBoxForTesting: FC<MdBoxProps> = ({
  imageOptions,
  slots,
  ...restProps
}) => {
  return (
    <MdBox
      {...restProps}
      imageOptions={{
        ...imageOptions,
        unoptimized: true,
        ssr: true,
        layout: 'raw',
      }}
      forceBrInterSpacing
      slots={slots}
    />
  );
};
