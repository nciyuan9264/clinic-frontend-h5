import React, { FC, Fragment, ReactNode, createElement } from 'react';

import { isFunction } from 'lodash-es';
import { DOMNode, Element, attributesToProps } from 'html-react-parser';
import cs from 'classnames';

import { useMdBoxSlots } from '../../contexts';

const AUTO_HIDE_LAST_SIBLING_BR_CLASS = 'auto-hide-last-sibling-br';

export interface BlockElementChildrenProps {
  className: string;
}

export interface BlockElementProps {
  node?: Element;
  renderRest?: (node: DOMNode) => React.ReactNode | undefined;
  style?: React.CSSProperties;
  className?: string;
  children?: ReactNode | ((params: BlockElementChildrenProps) => ReactNode);
}

export const BlockElement: FC<BlockElementProps> = ({
  node,
  renderRest,
  style,
  className,
  children,
}) => {
  const { BreakLine } = useMdBoxSlots();

  const {
    style: extraStyle,
    className: extraClassName,
    ...restProps
  } = attributesToProps(node?.attribs ?? {});

  return (
    <>
      {node &&
        createElement(
          node.name,
          {
            ...restProps,
            style: {
              ...extraStyle,
              ...style,
            },
            className: cs(
              extraClassName,
              className,
              AUTO_HIDE_LAST_SIBLING_BR_CLASS,
            ),
          },
          ...node.children.map((item, index) => (
            <Fragment key={index}>{renderRest?.(item as any)}</Fragment>
          )),
        )}
      {isFunction(children)
        ? children({ className: cs(AUTO_HIDE_LAST_SIBLING_BR_CLASS) })
        : children}
      {BreakLine && <BreakLine />}
    </>
  );
};
