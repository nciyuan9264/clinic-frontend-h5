import React, { FC } from 'react';

import cs from 'classnames';

import { MdBoxIndicatorProps } from '../../contexts';

import styles from './index.module.less';

export const Indicator: FC<MdBoxIndicatorProps> = ({ className, style }) => {
  return (
    <span className={styles.container}>
      <span
        className={cs(styles.indicator, styles.flashing, className)}
        style={style}
        data-testid="indicator"
      />
    </span>
  );
};

export default Indicator;
