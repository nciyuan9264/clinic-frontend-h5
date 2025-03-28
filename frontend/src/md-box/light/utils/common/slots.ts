/* eslint-disable @typescript-eslint/prefer-for-of */
import { Buffer } from 'buffer';

import { isNumber, isUndefined } from 'lodash-es';

import { pipe } from '../../../utils';

export type InsertedElementItemType = 'inline' | 'newline' | 'block';

export interface InsertedElementItem {
  /** 插入位置，为数字时则仅插入，为列表时则当作替换范围 */
  range: number | [number, number];
  render: (text?: string) => JSX.Element | undefined;
  /**
   * 展示模式
   * inline: 行内
   * newline: 另启单行（仍然在当前块元素）
   * block: 另启块元素（脱离当前块元素）
   * @default 'inline'
   */
  type?: InsertedElementItemType;
}

interface Operation {
  replaceRange: [number, number];
  insert: string;
  index: number;
}

export const INSERT_ELEMENT_SLOT_NAME = 'insert_element';

export const getTextSlotString = (key: string) => `{${key}}`;

interface GetInsertElementSlotStringParams {
  data: string;
  index: number;
  wrapWith?: string;
}

const getInsertElementSlotString = ({
  data,
  index,
  wrapWith = '',
}: GetInsertElementSlotStringParams) =>
  `${wrapWith}${getTextSlotString(
    `${INSERT_ELEMENT_SLOT_NAME}_${index}_${Buffer.from(data).toString(
      'base64',
    )}`.replace(/_/g, '\\_'),
  )}${wrapWith}`;

const insertElementSlotRegex = `\\{${INSERT_ELEMENT_SLOT_NAME.replace(
  /_/g,
  '\\\\_',
)}\\\\_(?<index>[0-9]+)\\\\_(?<b64_data>.*?)\\}`;

export const startOfInsertElementSlot = (source: string) => {
  return new RegExp(insertElementSlotRegex).exec(source)?.index;
};

export const matchInsertElementSlot = (source: string) => {
  const matchResult = new RegExp(`^${insertElementSlotRegex}`).exec(source);
  return matchResult?.[0];
};

interface InsertElementSlotData {
  index: number;
  b64Text: string;
  text: string;
}

export const extractDataFromInsertElementSlot = (
  insertElementSlot: string,
): InsertElementSlotData | undefined => {
  const matchResult = new RegExp(`^${insertElementSlotRegex}$`).exec(
    insertElementSlot,
  );
  const { index, b64_data } = matchResult?.groups || {};

  if (!isUndefined(index) && !isUndefined(b64_data)) {
    return {
      index: parseInt(index),
      b64Text: b64_data,
      text: b64_data && Buffer.from(b64_data, 'base64').toString('utf8'),
    };
  }
};

const convertToOperation = (
  source: string,
  insertList: InsertedElementItem[],
): Operation[] => {
  const result: Operation[] = [];

  const wrapWithMapping: Record<InsertedElementItemType, string> = {
    inline: '',
    newline: '\n',
    block: '\n\n',
  };

  insertList.forEach(({ range, type = 'inline' }, index) => {
    const realRange: [number, number] = isNumber(range)
      ? [range, range]
      : range;

    const [start, end] = realRange;

    if (start > end) {
      return;
    }

    if (start > source.length) {
      return;
    }

    result.push({
      replaceRange: isNumber(range) ? [range, range] : range,
      insert: getInsertElementSlotString({
        index,
        data: source.slice(...realRange),
        wrapWith: wrapWithMapping[type],
      }),
      index: result.length,
    });
  });

  return result;
};

const transformOperationInOrder = (
  current: Operation,
  another: Operation,
): Operation => {
  const [currentStart, currentEnd] = current.replaceRange;

  const [previousStart, previousEnd] = another.replaceRange;

  const previousInsertLength =
    another.insert.length - (previousEnd - previousStart);

  if (currentStart < previousStart) {
    return current;
  }

  if (currentStart === previousStart && current.index < another.index) {
    return current;
  }

  const offset = Math.min(
    Math.max(0, previousEnd - currentStart),
    currentEnd - currentStart,
  );

  return {
    ...current,
    replaceRange: [
      currentStart + previousInsertLength + offset,
      currentEnd + previousInsertLength,
    ],
  };
};

export const transformEach = (operations: Operation[]): Operation[] => {
  const result: Operation[] = [];

  for (let outerIndex = 0; outerIndex < operations.length; outerIndex += 1) {
    let operation = operations[outerIndex];

    for (let index = 0; index < result.length; index += 1) {
      operation = transformOperationInOrder(operation, result[index]);
    }

    result.push(operation);
  }

  return result;
};

const applyOperationToString = (source: string, operation: Operation) => {
  const {
    replaceRange: [start, end],
    insert,
  } = operation;
  return `${source.slice(0, start)}${insert}${source.slice(end)}`;
};

export const applyInsertListToString = (
  source: string,
  insertList: InsertedElementItem[],
) => {
  const operations = transformEach(convertToOperation(source, insertList));

  const applySummary = pipe(
    ...operations.map(
      (item) => (source: string) => applyOperationToString(source, item),
    ),
  );

  return applySummary(source);
};

export const addInsertElementSlotToString = (
  source: string,
  insertList: InsertedElementItem[],
) => {
  return applyInsertListToString(source, insertList);
};

export const removeInsertElementSlotInString = (source: string) => {
  return source.replace(new RegExp(insertElementSlotRegex, 'g'), (slotText) => {
    const extractedSlot = extractDataFromInsertElementSlot(slotText);
    if (!extractedSlot) {
      return '';
    }
    return extractedSlot.text;
  });
};
