export const pipe = <T>(...funcList: ((params: T) => T)[]) => {
  return (source: T) => {
    return funcList.reduce((prev, curr) => {
      return curr(prev);
    }, source);
  };
};

export const isNumeric = (str: string) => {
  const rawNumber = str.replace(/,/g, '');
  // @ts-expect-error isNaN could pass string type
  return !isNaN(rawNumber) && !isNaN(parseFloat(rawNumber));
};

export const firstMatch = <T, P>(
  items: T[],
  iterator: (item: T) => undefined | null | P,
): undefined | P => {
  for (const item of items) {
    const result = iterator(item);
    if (result) {
      return result;
    }
  }
};

export const timeoutPromise = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

export const elementAt = <T>(array: T[], index: number): T | undefined => {
  return array[index];
};

export const splitStringByPattern = (source: string, pattern: RegExp) => {
  const result: string[] = [];

  const { flags } = pattern;

  const copiedPattern = new RegExp(
    pattern.source,
    flags.includes('g') ? flags : `${flags}g`,
  );

  let matched: RegExpExecArray | null;

  let prevEndIndex = 0;

  // eslint-disable-next-line no-cond-assign
  while ((matched = copiedPattern.exec(source))) {
    const matchedText = matched[0];

    if (matched.index > prevEndIndex) {
      result.push(source.slice(prevEndIndex, matched.index));
    }

    result.push(matchedText);

    prevEndIndex = matched.index + matchedText.length;
  }

  if (source.length > prevEndIndex) {
    result.push(source.slice(prevEndIndex, source.length));
  }

  return result;
};
