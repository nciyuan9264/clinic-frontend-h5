import htmlEntity from 'he';
import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';

// eslint-disable-next-line max-lines-per-function
describe('html渲染测试', () => {
  test('默认支持的html标签', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
<span>span标签</span>
<u>u标签</u>
br标签<br/>
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('默认不支持的html标签', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
<img src="https://domain.com/index.png" />
<input />
<textarea />
<table />
<html />
<body />
<head />
<meta />
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('对支持的html标签转义', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={String.raw`
\<span>span标签\</span>
\<u>u标签\</u>
br标签\<br/>
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('危险标签', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
<link href="https://domain.com/index.css" />
<script src="https://domain.com/index.js"/>
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  describe('设置 enabledHtmlTags 开启标签支持', () => {
    const htmlHybridTagsText = `
这是<u>下划线</u>文本
这是<span style="color:green;">高亮</span>文本
这是<strong>加粗</strong>文本
这是<em>强调</em>文本
这是<div>普通</div>文本
这是<a href="https://test.com">链接</a>文本
这是<my-custom-tag>自定义标签</my-custom-tag>
    `;

    test('设置 enabledHtmlTags = false 时等效于不设置', async () => {
      const rootViewWithoutSetTags = await act(() =>
        render(
          <MdBoxForTesting
            markDown={htmlHybridTagsText}
            autoFixSyntax={{ autoFixEnding: false }}
          />,
        ),
      );

      const rootViewWithSetTagsFalse = await act(() =>
        render(
          <MdBoxForTesting
            markDown={htmlHybridTagsText}
            autoFixSyntax={{ autoFixEnding: false }}
            enabledHtmlTags={false}
          />,
        ),
      );

      expect(rootViewWithoutSetTags.asFragment()).toStrictEqual(
        rootViewWithSetTagsFalse.asFragment(),
      );
    });

    test('启用部分标签，验证启用生效', async () => {
      const rootViewWithoutSetTags = await act(() =>
        render(
          <MdBoxForTesting
            markDown={htmlHybridTagsText}
            autoFixSyntax={{ autoFixEnding: false }}
          />,
        ),
      );

      const rootViewWithSetSomeTags = await act(() =>
        render(
          <MdBoxForTesting
            markDown={htmlHybridTagsText}
            autoFixSyntax={{ autoFixEnding: false }}
            enabledHtmlTags={['strong', 'em', 'my-custom-tag']}
          />,
        ),
      );

      expect(rootViewWithoutSetTags.asFragment()).toMatchDiffSnapshot(
        rootViewWithSetSomeTags.asFragment(),
      );
    });

    test('二次渲染时启用部分标签，验证启用生效', async () => {
      const rootView = await act(() =>
        render(
          <MdBoxForTesting
            markDown={htmlHybridTagsText}
            autoFixSyntax={{ autoFixEnding: false }}
          />,
        ),
      );

      const prevFragment = rootView.asFragment();

      await act(() =>
        rootView.rerender(
          <MdBoxForTesting
            markDown={htmlHybridTagsText}
            autoFixSyntax={{ autoFixEnding: false }}
            enabledHtmlTags={['strong', 'em', 'my-custom-tag']}
          />,
        ),
      );

      expect(prevFragment).toMatchDiffSnapshot(rootView.asFragment());
    });

    test('启用全部标签，验证启用生效', async () => {
      const rootViewWithoutSetTags = await act(() =>
        render(
          <MdBoxForTesting
            markDown={htmlHybridTagsText}
            autoFixSyntax={{ autoFixEnding: false }}
            enabledHtmlTags={['strong', 'em', 'my-custom-tag']}
          />,
        ),
      );

      const rootViewWithSetAllTags = await act(() =>
        render(
          <MdBoxForTesting
            markDown={htmlHybridTagsText}
            autoFixSyntax={{ autoFixEnding: false }}
            enabledHtmlTags
          />,
        ),
      );

      expect(rootViewWithoutSetTags.asFragment()).toMatchDiffSnapshot(
        rootViewWithSetAllTags.asFragment(),
      );
    });
  });

  test('自定义渲染，验证正确渲染', async () => {
    const customRenderHtmlString = `
这是<strong>加粗</strong>文本
这是<my-custom-tag>自定义渲染<span style="color:green;">高亮中的<u>下划线</u></span>内容</my-custom-tag>文本
这是<blockquote>不支持的标签</blockquote>和后缀文本
`;

    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={customRenderHtmlString}
          enabledHtmlTags={['strong', 'my-custom-tag']}
          renderHtml={({ tagName, props, children }) => {
            if (tagName === 'my-custom-tag') {
              return (
                <div {...props} id="custom-rendered-mark-tag">
                  {children}
                </div>
              );
            }
          }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});

describe('Data 插槽式标签渲染测试', () => {
  const htmlEncode = (value: string) =>
    htmlEntity.encode(value, {
      strict: false,
    });

  const dataSlotString = `行内插槽标签：

prefix<data-inline type="user" value="${htmlEncode(
    htmlEncode(
      JSON.stringify({
        name: 'xiaoming',
        age: 12,
      }),
    ),
  )}" alt="不支持的标签" />suffix

单行插槽标签：

prefix<data-block type="user" value="${htmlEncode(
    htmlEncode(
      JSON.stringify({
        name: 'xiaoming',
        age: 12,
      }),
    ),
  )}" alt="不支持的标签" />suffix

这是<my-custom-tag>未开启的标签</my-custom-tag>

这是<span>已开启的标签</span>
`;

  test('自定义渲染，验证正确渲染', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={dataSlotString}
          renderDataSlot={({ display, type, value, alt, children }) => {
            const text = `类型：${type}, 兜底内容：${alt}, 值：${JSON.stringify(
              value,
            )}`;

            const Tag = display === 'inline' ? 'span' : 'div';

            return (
              <Tag>
                {text}
                {children}
              </Tag>
            );
          }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
