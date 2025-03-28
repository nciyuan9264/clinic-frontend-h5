import { isUndefined } from 'lodash-es';

export const parseJSONWithNull = <T = unknown>(
  value?: string | null,
): T | null => {
  try {
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
};

/**
 * 获取数组指定下标元素，类型严格
 */
export const getByIndex = <T>(
  list: T[] | undefined,
  index: number | undefined,
): T | undefined => {
  if (isUndefined(index)) {
    return;
  }

  return list?.[index];
};
