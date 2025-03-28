import React from 'react';

import cs from 'classnames';

import { MdBoxTexProps } from '../../contexts';

export const LightTex: React.FC<MdBoxTexProps> = ({
  tex,
  /** 目前由于渲染样式要求，不消费 mode 参数 */
  mode: _mode,
  className,
  style,
}) => {
  return (
    <span className={cs('math-inline', className)} style={style}>
      {tex}
    </span>
  );
};

export default LightTex;
