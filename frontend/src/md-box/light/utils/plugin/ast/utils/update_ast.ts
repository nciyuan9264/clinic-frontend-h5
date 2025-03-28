import type { Content, Parent } from 'mdast';
import { first, isNumber } from 'lodash-es';

import { isParent } from '../../../common';
/** 自定义前缀时，在monorepo内直接引用会有类型问题 */
import { assert } from '../../../../../utils';

export interface UpdateAstDetectorAction {
  stop: () => void;
  /** 由于后序遍历的特性，此操作在这种情况下无效 */
  skip: () => void;
  insertAfter: (content: Content[], replaceCurrent?: boolean) => void;
}

export interface UpdateAstDetectorParams {
  /** 父节点 */
  parent: Parent | undefined;
  /** 父节点列表，越靠近的父节点越靠前 */
  parents: Parent[];
  /** 当前节点在父节点中的位置下标 */
  index: number | undefined;
}
export interface UpdateAstOptions {
  /**
   * 遍历顺序：
   * - pre_order: 前序遍历
   * - post_order: 后序遍历
   * - in_order: 中序遍历（扩展自二叉树），在多叉树中，当第二次经过非叶节点时，则访问
   * @default 'pre_order'
   */
  order?: 'pre_order' | 'post_order' | 'in_order';
  /**
   * 是否左右翻转，若为true，则右节点比左节点先访问，但是父子节点的访问顺序不变
   * @default false
   */
  isReverse?: boolean;
}

export type UpdateAstModifier<T = Parent> = (
  current: Content | T,
  actionsAndParams: UpdateAstDetectorAction & UpdateAstDetectorParams,
) => void;

/**
 * 深度优先先序遍历并动态更新Ast，更新的节点不会在本次遍历范围内，防止不当的modifier导致的死循环
 * @param ast Ast树根
 * @param modifier 更新器
 * @param options 可选参数
 */
// eslint-disable-next-line max-lines-per-function
export const updateAst = <T extends Content | Parent>(
  ast: T,
  modifier: UpdateAstModifier<T>,
  options: UpdateAstOptions = {},
) => {
  const { order = 'pre_order', isReverse = false } = options;

  let shouldStop = false;

  let shouldSkip = false;

  let isFinished = false;

  /** 第一项为父节点引用 */
  const stack: [Parent[], Content | T][] = [[[], ast]];

  /** 后序遍历需要 */
  const visitedList: (Parent | Content)[] = [];

  while (stack.length) {
    const stackItem = stack.pop();

    assert(stackItem, 'current must not be undefined');

    const [parents, current] = stackItem;

    const parent = first(parents);

    const currentChildren = !isParent(current) ? [] : current.children.slice();

    const stagedChildren =
      /** 从左向右访问则列表则入栈顺序相反 */
      isReverse ? currentChildren : currentChildren.reverse();

    const stagedChildrenWithItsParent = isParent(current)
      ? stagedChildren.map((item): [Parent[], Content] => [
          [current, ...parents],
          item,
        ])
      : [];

    const insertAfter = (content: Content[], replaceCurrent = false) => {
      if (!parent) {
        return;
      }

      const indexOfCurrent = parent.children.findIndex(
        (item) => item === current,
      );

      assert(
        isNumber(indexOfCurrent),
        'Invoke insertAfter error in updateAst: parent is not parent of current',
      );

      if (replaceCurrent) {
        parent.children.splice(indexOfCurrent, 1, ...content);
      } else {
        parent.children.splice(indexOfCurrent + 1, 0, ...content);
      }
    };

    const stop = () => {
      if (isFinished) {
        throw Error('You have to call stop synchronously');
      }
      shouldStop = true;
    };

    const skip = () => {
      if (isFinished) {
        throw Error('You have to call skip synchronously');
      }
      shouldSkip = true;
    };

    const visit = () => {
      const index = parent?.children.findIndex((item) => item === current);

      assert(index !== -1, "Current must be child of it's parent");

      modifier(current, {
        stop,
        skip,
        insertAfter,
        parent,
        parents,
        index,
      });
    };

    if (order === 'pre_order') {
      visit();

      if (!shouldSkip) {
        stack.push(...stagedChildrenWithItsParent);
      }
    } else if (order === 'post_order') {
      const unvisitedChildrenWithItsParent = stagedChildrenWithItsParent.filter(
        ([, item]) => !visitedList.includes(item),
      );

      if (unvisitedChildrenWithItsParent.length) {
        /** 暂时不访问当前节点，无论如何都插入未访问的子节点到栈中 */
        stack.push(stackItem);
        stack.push(...unvisitedChildrenWithItsParent);
      } else {
        /** 仅全部子节点访问完毕再访问当前节点（包括刚访问其余子节点时插入的子节点） */
        visit();
        visitedList.push(current);
      }
    } else if (order === 'in_order') {
      /** 非叶子结点且任意子节点都没访问过时，有序插入队列 */
      if (
        isParent(current) &&
        stagedChildrenWithItsParent.length &&
        stagedChildrenWithItsParent.every(
          ([, item]) => !visitedList.includes(item),
        )
      ) {
        stack.push(
          ...stagedChildrenWithItsParent.slice(
            0,
            stagedChildrenWithItsParent.length - 1,
          ),
        );

        stack.push(stackItem);

        stack.push(
          stagedChildrenWithItsParent[stagedChildrenWithItsParent.length - 1],
        );
      } else {
        /** 叶子结点或被访问过子节点的非叶子结点，直接访问 */
        visit();
        visitedList.push(current);
      }
    }

    if (shouldStop) {
      break;
    }

    shouldStop = false;

    shouldSkip = false;
  }

  isFinished = true;
};
