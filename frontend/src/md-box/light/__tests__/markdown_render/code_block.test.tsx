import { FC } from 'react';

import { Element } from 'html-react-parser';
import cs from 'classnames';
import { render, act, fireEvent } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';
import { CodeBarConfigGetterParams } from '../../utils/renderer/code';
import {
  MdBoxCodeBarProps,
  MdBoxCodeBlockHighlighterProps,
  MdBoxCodeBlockProps,
  useMdBoxSlots,
} from '../../../contexts';

// eslint-disable-next-line max-lines-per-function
describe('基础代码块渲染测试', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('围栏式代码块', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
前缀文字

这是一个代码块：
\`\`\`python
print('hello world')
\`\`\`

后缀文字
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('缩进式代码块（屏蔽语法）', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
前缀文字

    print('hello world')

后缀文字
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('缩进式代码块，主动启用', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
前缀文字

    print('hello world')

后缀文字
`}
          autoFixSyntax={{ autoFixEnding: false }}
          indentedCode
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('result语言的代码块隐藏头部，不区分大小写', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
\`\`\`ReSult
print('B')
\`\`\`
`}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('自定义渲染代码块 + 高亮渲染器', async () => {
    const CustomCodeBlock: FC<MdBoxCodeBlockProps> = ({
      code,
      language,

      className,
      style,
      showHeader = true,
    }) => {
      const { CodeBlockHighlighter } = useMdBoxSlots();

      return (
        <div
          className={cs('custom-codeblock', `language-${language}`, className)}
          style={style}
        >
          {showHeader && <>Code Bar Header: {language}</>}
          {CodeBlockHighlighter && (
            <CodeBlockHighlighter code={code} language={language} />
          )}
        </div>
      );
    };

    const CustomCodeBlockHighlighter: FC<MdBoxCodeBlockHighlighterProps> = ({
      code,
      language,

      className,
      style,
    }) => {
      return (
        <div
          className={cs(
            'custom-codeblock-highlighter',
            `language-${language}`,
            className,
          )}
          style={style}
        >
          language: {language}
          code: {code}
        </div>
      );
    };

    const CustomCodeBar: FC<MdBoxCodeBarProps> = ({
      loading,
      showBar = true,
      defaultExpand = true,
      children,
      className,
      style,
    }) => {
      return (
        <>
          {showBar && (
            <div className={className} style={style}>
              {loading && 'loading'}
            </div>
          )}
          {children?.(defaultExpand)}
        </>
      );
    };

    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
前缀文字

这是一个代码块：
\`\`\`python
print('hello world')
\`\`\`

后缀文字
`}
          autoFixSyntax={{ autoFixEnding: false }}
          slots={{
            CodeBlock: CustomCodeBlock,
            CodeBlockHighlighter: CustomCodeBlockHighlighter,
            CodeBar: CustomCodeBar,
          }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});

describe('语言高亮测试', () => {
  test('大写仍然能高亮', async () => {
    const upperCase = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
\`\`\`PYTHON
print('hello world')
\`\`\`
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(upperCase.asFragment()).toMatchSnapshot();
  });

  test('无语言等于plainText', async () => {
    const noLanguage = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
\`\`\`
print('hello world')
\`\`\`
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );
    const plainText = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
\`\`\`
print('hello world')
\`\`\`
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(noLanguage.asFragment()).toStrictEqual(plainText.asFragment());
  });
});

describe('复制功能测试', () => {
  const CODE_BLOCK_COPY_TEST_ID = 'code_block_copy';

  beforeEach(() => {
    jest.useRealTimers();
  });

  test('点击按钮展示成功状态，并且成功复制内容', async () => {
    const codeText = `
\`\`\`python
print('hello world')
\`\`\`
    `;

    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={codeText}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.queryByTestId(CODE_BLOCK_COPY_TEST_ID)).toBeInTheDocument();

    let prevRender = rootView.asFragment();

    const mockPrompt = jest.fn();

    window.prompt = mockPrompt;

    jest.useFakeTimers();

    await act(() => {
      fireEvent.click(rootView.getByTestId(CODE_BLOCK_COPY_TEST_ID));
    });

    expect(prevRender).toMatchDiffSnapshot(
      (prevRender = rootView.asFragment()),
      {},
      '切换成了对勾样式',
    );

    /** 调用复制API */
    expect(mockPrompt).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining("print('hello world')"),
    );

    jest.advanceTimersByTime(3000);

    await act(() => {
      rootView.rerender(
        <MdBoxForTesting
          markDown={codeText}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      );
    });

    expect(prevRender).toMatchDiffSnapshot(
      (prevRender = rootView.asFragment()),
      {},
      '3s后切换回原样式',
    );
  });
});

// eslint-disable-next-line max-lines-per-function
describe('代码块控制条开启测试', () => {
  test('设置默认不展开，设置文案', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
\`\`\`
print('hello world')
\`\`\`
`}
          codeBarConfig={{
            finished: true,
            defaultExpand: false,
          }}
          translate={{
            codeBarLoadingText: 'loading fake text',
            codeBarExpandedFinishedText: 'can hide fake text',
            codeBarUnExpandFinishedText: 'can expand fake text',
          }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('设置默认展开', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
\`\`\`
print('hello world')
\`\`\`
`}
          codeBarConfig={{
            finished: true,
            defaultExpand: true,
          }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('相邻的一组代码块共用一个控制条', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
第一组代码块：
\`\`\`
print('A')
\`\`\`
\`\`\`
print('B')
\`\`\`
第二组代码块：
\`\`\`
print('C')
\`\`\`
`}
          codeBarConfig={{
            finished: true,
            defaultExpand: true,
          }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('相邻的一组代码块，可以禁用合并能力，每个代码块独自有控制条', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
第一组代码块：
\`\`\`
print('A')
\`\`\`
\`\`\`
print('B')
\`\`\`
第二组代码块：
\`\`\`
print('C')
\`\`\`
`}
          codeBarConfig={{
            finished: true,
            defaultExpand: true,
            compact: true,
          }}
          adjacentCodeAsGroup={false}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('相邻的一组代码块允许开启压缩多代码块的能力', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
第一组代码块：
\`\`\`
print('A')
\`\`\`
\`\`\`
print('B')
\`\`\`
第二组代码块：
\`\`\`
print('C')
\`\`\`
第三组代码块：
\`\`\`
print('D')
\`\`\`
`}
          codeBarConfig={{
            finished: true,
            defaultExpand: true,
            compact: true,
          }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('点击可以展开折叠', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
\`\`\`
print('A')
\`\`\`
`}
          codeBarConfig={{
            finished: true,
            defaultExpand: false,
          }}
        />,
      ),
    );

    let prevFragment = rootView.asFragment();

    fireEvent.click(rootView.getByTestId('code-bar'));

    expect(prevFragment).toMatchDiffSnapshot(
      (prevFragment = rootView.asFragment()),
      {},
      '点击展开',
    );

    fireEvent.click(rootView.getByTestId('code-bar'));

    expect(prevFragment).toMatchDiffSnapshot(
      rootView.asFragment(),
      {},
      '点击折叠',
    );
  });

  test('当没有完成时展示加载状态', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
第一个代码块：
\`\`\`
print('A')
\`\`\`
第二个代码块：
\`\`\`
print('B')
\`\`\`
`}
          codeBarConfig={{
            finished: false,
            defaultExpand: false,
          }}
        />,
      ),
    );

    const initialFragment = rootView.asFragment();

    expect(initialFragment).toMatchSnapshot('非末尾是完成态，末尾是加载态');

    rootView.rerender(
      <MdBoxForTesting
        markDown={`
第一个代码块：
\`\`\`
print('A')
\`\`\`
第二个代码块：
\`\`\`
print('B')
\`\`\`
最后一行
`}
        codeBarConfig={{
          finished: false,
          defaultExpand: false,
        }}
      />,
    );

    expect(initialFragment).toMatchDiffSnapshot(
      rootView.asFragment(),
      {},
      '末尾代码块后追加任意文本，加载状态消失',
    );

    rootView.rerender(
      <MdBoxForTesting
        markDown={`
第一个代码块：
\`\`\`
print('A')
\`\`\`
第二个代码块：
\`\`\`
print('B')
\`\`\`
`}
        codeBarConfig={{
          finished: true,
          defaultExpand: false,
        }}
      />,
    );

    expect(initialFragment).toMatchDiffSnapshot(
      rootView.asFragment(),
      {},
      '变成完成态，加载状态消失',
    );
  });

  test('支持传入控制条配置生成函数', async () => {
    const mockConfigGetter = jest.fn(() => ({
      finished: false,
      defaultExpand: false,
    }));

    await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
第一个代码块：
\`\`\`compute
print('A')
\`\`\`
\`\`\`result
print('B')
\`\`\`
第二个代码块：
\`\`\`javascript
print('B')
\`\`\`
`}
          codeBarConfig={mockConfigGetter}
        />,
      ),
    );

    expect(mockConfigGetter).toHaveBeenNthCalledWith<
      [CodeBarConfigGetterParams]
    >(1, {
      codeBlocks: [
        {
          target: expect.any(Element),
          language: 'compute',
          code: expect.any(String),
        },
        {
          target: expect.any(Element),
          language: 'result',
          code: expect.any(String),
        },
      ],
    });

    expect(mockConfigGetter).toHaveBeenNthCalledWith<
      [CodeBarConfigGetterParams]
    >(2, {
      codeBlocks: [
        {
          target: expect.any(Element),
          language: 'javascript',
          code: expect.any(String),
        },
      ],
    });
  });

  test('当defaultExpand变化时，内部展开、折叠状态受控', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
\`\`\`compute
print('A')
\`\`\`
`}
          codeBarConfig={() => ({
            finished: false,
            defaultExpand: true,
          })}
        />,
      ),
    );

    const expandedFragment = rootView.asFragment();

    rootView.rerender(
      <MdBoxForTesting
        markDown={`
\`\`\`compute
print('A')
\`\`\`
`}
        codeBarConfig={() => ({
          finished: false,
          defaultExpand: false,
        })}
      />,
    );

    expect(expandedFragment).toMatchDiffSnapshot(
      rootView.asFragment(),
      {},
      'defaultExpand变为false，内部自动折叠',
    );
  });
});
