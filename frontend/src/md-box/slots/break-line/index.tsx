import React, { ComponentType, FC } from 'react';

import cs from 'classnames';

import { isSafari } from '../../utils';
import { MdBoxBreakLineProps } from '../../contexts';

import wrapperStyles from './wrapper.module.less';
import styles from './index.module.less';

export const BreakLine: FC<MdBoxBreakLineProps> = ({ className, style }) => {
  return <br className={cs(styles.container, className)} style={style} />;
};

/** 扩展插槽版 BreakLine，加上必要的样式 */
export const withMdBoxBreakLine = (
  Target: ComponentType<MdBoxBreakLineProps> | null,
): FC<MdBoxBreakLineProps> => {
  return function WrappedBreakLine({ className, ...restProps }) {
    return (
      <>
        {Target && (
          <Target
            className={cs(wrapperStyles.wrapper, className, {
              /** Safari 和 Chrome 表现不一致导致
               * 1. Safari 下设置 user-select: none 会导致复制丢失换行
               * 2. Chrome 下不设置 user-select: none 会有多余的、短的选中效果
               *  */
              [styles['non-select']]: !isSafari(),
            })}
            {...restProps}
          />
        )}
      </>
    );
  };
};
