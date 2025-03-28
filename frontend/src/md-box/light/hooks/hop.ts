import { useEffect, useRef } from 'react';

import { Parent } from 'mdast';
import { isUndefined } from 'lodash-es';
import { usePrevious } from 'ahooks';

import { convertToStanardNodeTypeEnum, getHopDiff } from '../utils/hop';
import { OnHopCallback } from '../type';

export interface UseHopParams {
  onHop?: OnHopCallback;

  ast?: Parent;

  text: string;

  getRenderedText: () => string;
}

export const useHop = ({ onHop, ast, text, getRenderedText }: UseHopParams) => {
  const prevRenderedTextRef = useRef('');

  const prevText = usePrevious(text);

  const prevAst = usePrevious(ast);

  useEffect(() => {
    const prevRenderedText = prevRenderedTextRef.current;

    const renderedText = getRenderedText().trim();

    if (
      !isUndefined(prevRenderedText) &&
      !isUndefined(prevText) &&
      !isUndefined(prevAst) &&
      !isUndefined(ast) &&
      onHop
    ) {
      if (
        text.length > prevText.length &&
        renderedText.length < prevRenderedText.length
      ) {
        const hopResult = getHopDiff(prevAst, ast);

        if (hopResult) {
          const { prevEndNode, endNode } = hopResult;

          onHop({
            renderedText,
            prevRenderedText,
            ast,
            prevAst,
            prevEndNode,
            endNode,
            prevEndNodeType: convertToStanardNodeTypeEnum(prevEndNode?.type),
            endNodeType: convertToStanardNodeTypeEnum(endNode?.type),
          });
        }
      }
    }

    prevRenderedTextRef.current = renderedText;
  }, [text]);
};
