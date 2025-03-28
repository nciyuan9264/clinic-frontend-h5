import React, { FC } from 'react';

import cs from 'classnames';

import { MdBoxTableProps } from '../../contexts';

import styles from './index.module.less';

export const Table: FC<MdBoxTableProps> = ({
  children,
  className,
  raw: _raw,
  parents: _parents,
  ...restProps
}) => {
  return (
    <div className={cs(className, styles['table-container'])} {...restProps}>
      <table>{children}</table>
    </div>
  );
};

export default Table;
