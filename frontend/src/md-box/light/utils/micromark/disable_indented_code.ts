import { Extension } from 'micromark-util-types';

export const disableIndentedCode = (): Extension => {
  return {
    disable: {
      /**
       * 禁用 Indented Code
       * 出处：https://github.com/micromark/micromark/blob/HEAD/test/io/flow/code-indented.js#L121
       */
      null: ['codeIndented'],
    },
  };
};
