import { FC } from 'react';

import { MathJaxTex } from '../mathjax-tex';
import { KatexTex } from '../katex-tex';
import { MdBoxTexProps } from '../../contexts';

export const KatexMathjaxTex: FC<MdBoxTexProps> = (props) => {
  return (
    <KatexTex
      {...props}
      katexOptions={{
        strict: true,
        throwOnError: true,
      }}
      fallback={<MathJaxTex {...props} />}
    />
  );
};

export default KatexMathjaxTex;
