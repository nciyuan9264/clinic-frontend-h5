import { FC } from 'react';

import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';
import { MdBoxTexProps } from '../../../contexts';

const CustomTex: FC<MdBoxTexProps> = ({ tex }) => {
  return <div>这是公式“{tex}”的html</div>;
};

describe('自定义公式渲染', () => {
  test('美元符号格式公式', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
行内语法：$1+1=2$
单行语法：$$1+1=2$$
  `}
          autoFixSyntax={{ autoFixEnding: false }}
          slots={{
            Tex: CustomTex,
          }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('Latex格式（括号形式）公式', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={String.raw`
行内语法：\(1+1=2\)
单行语法：\[1+1=2\]
  `}
          autoFixSyntax={{ autoFixEnding: false }}
          slots={{
            Tex: CustomTex,
          }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
