import React, { cloneElement, FC, isValidElement } from 'react';

import cs from 'classnames';

import { MdBoxParagraphProps } from '../../contexts';

import styles from './index.module.less';

export const Paragraph: FC<MdBoxParagraphProps> = ({
  children,
  className,
  forceBrInterSpacing = false,
  raw: _raw,
  parents: _parents,
  ...restProps
}) => {
  /**
   * 当元素从 N 到 1 相互变化时，首个元素的 key 会从 0 到 undefined 变化，导致销毁
   * 此方法用于解决多余的销毁
   */
  const renderChildren = () => {
    if (isValidElement(children)) {
      return cloneElement(children, { key: '0' });
    }

    return children;
  };

  return (
    <div
      className={cs(className, styles.paragraph, 'paragraph-element', {
        'br-paragraph-space': forceBrInterSpacing,
      })}
      {...restProps}
    >
      {renderChildren()}
    </div>
  );
};

export default Paragraph;
