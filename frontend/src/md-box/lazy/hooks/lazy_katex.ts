import { useCallback, useMemo, useState } from 'react';

import { retryLoad, type KatexType } from '../../light';

export class DefaultParseError extends Error {
  constructor(
    public message: string,
    public lexer: unknown,
    public position: number,
  ) {
    super();
  }
}

export const useLazyKatex = (): KatexType => {
  const [katex, setKatex] = useState<KatexType>();

  const handleFetchKatex = useCallback(async () => {
    if (katex) {
      return;
    }

    const { default: loadedKatex } = await retryLoad(() => import('katex'));

    setKatex(loadedKatex);
  }, [katex]);

  const defaultKatex: KatexType = useMemo(
    () =>
      // eslint-disable-next-line unicorn/no-static-only-class, @typescript-eslint/no-extraneous-class
      class DefaultKatex {
        static render(): string {
          handleFetchKatex();
          throw new DefaultParseError('DefaultKatex.render has called', {}, 0);
        }
        static renderToString(): string {
          handleFetchKatex();
          throw new DefaultParseError(
            'DefaultKatex.renderToString has called',
            {},
            0,
          );
        }
        static ParseError = DefaultParseError;
      },
    [handleFetchKatex],
  ) as any;

  return katex ?? defaultKatex;
};
