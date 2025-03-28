import React, { FC, useMemo } from 'react';

import { texToSvg } from './utils';
import { RawMathjaxTex } from './components';
import { purifyHtml } from '../../utils';
import { MdBoxTexProps } from '../../contexts';

export { RawMathjaxTex, type RawMathjaxTexProps } from './components';

export { texToSvg } from './utils';

export const MathJaxTex: FC<MdBoxTexProps> = ({
  className,
  style,

  tex,
  /** 目前由于渲染样式要求，不消费 mode 参数 */
  mode: _mode,
}) => {
  const svgString = useMemo(() => purifyHtml(texToSvg(tex)), [tex]);

  return (
    <RawMathjaxTex
      className={className}
      style={style}
      tex={tex}
      html={svgString}
    />
  );
};

export default MathJaxTex;
