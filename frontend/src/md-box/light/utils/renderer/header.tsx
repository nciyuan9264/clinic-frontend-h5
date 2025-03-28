import React from 'react';

import { isElementType } from './utils';
import { RenderFunction } from '../../type';
import { createMdBoxSlots } from '../../../contexts';

import styles from './index.module.less';

const ComposedHeader = createMdBoxSlots('Header');

export const renderHeader: RenderFunction = (node, { renderRest, parents }) => {
  if (!isElementType(node, /^h[0-9]+$/)) {
    return;
  }

  return (
    <ComposedHeader
      className={styles.header}
      node={node}
      raw={node}
      parents={parents}
      renderRest={renderRest}
    />
  );
};
