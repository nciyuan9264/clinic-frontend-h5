import { Extension } from 'micromark-util-types';

export const disableSetextHeading = (): Extension => {
  return {
    disable: {
      /**
       * 禁用Setext Heading
       * 出处：https://github.com/micromark/micromark/blob/HEAD/test/io/flow/heading-setext.js#L260
       */
      null: ['setextUnderline'],
    },
  };
};
