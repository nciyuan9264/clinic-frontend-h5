import { TokenizerAndRendererExtension } from 'marked';

import {
  extractDataFromInsertElementSlot,
  matchInsertElementSlot,
  startOfInsertElementSlot,
} from '../common';

export const INSERT_ELEMENT_SLOT_EXTENSION_NAME = 'insert_element_extension';

export const insertElementSlotExtension =
  (): TokenizerAndRendererExtension => ({
    name: INSERT_ELEMENT_SLOT_EXTENSION_NAME,
    level: 'inline',
    start(src) {
      return startOfInsertElementSlot(src);
    },
    tokenizer(src) {
      const matchedResult = matchInsertElementSlot(src);
      if (matchedResult) {
        return {
          type: INSERT_ELEMENT_SLOT_EXTENSION_NAME,
          raw: matchedResult,
        };
      }
    },
    renderer({ raw }) {
      if (!raw) {
        return false;
      }
      const extractedData = extractDataFromInsertElementSlot(raw);

      if (!extractedData) {
        return false;
      }

      const { index, b64Text } = extractedData;

      // eslint-disable-next-line max-len
      return `<span data-index="${index}" data-raw="${b64Text}" data-type="${INSERT_ELEMENT_SLOT_EXTENSION_NAME}"></span>`;
    },
  });
