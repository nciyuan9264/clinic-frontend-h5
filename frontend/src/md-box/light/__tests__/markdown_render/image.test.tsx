import { FC } from 'react';

import { render, act, fireEvent } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';
import { MdBoxImageProps } from '../../../contexts';

const mockImageNaturalSize = (
  image: HTMLElement,
  naturalSize: { naturalWidth: number; naturalHeight: number } = {
    naturalWidth: 100,
    naturalHeight: 150,
  },
) => {
  for (const [key, value] of Object.entries(naturalSize)) {
    Object.defineProperty(image, key, {
      value,
      writable: true, // You can use them as per your requirement.
      configurable: true,
    });
  }
};

// eslint-disable-next-line max-lines-per-function
describe('图片渲染测试', () => {
  test('基础语法', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
这是图片![img](https://bytedance.com/logo.png)
这是带标题的图片![img](https://bytedance.com/logo.png "bytedance title")
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('支持自动转换http为https', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
![img](http://bytedance.com/logo.png)
`}
          autoFixSyntax={{ autoFixEnding: false }}
          imageOptions={{ forceHttps: true }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('图片单独在一个段落中', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
第一段

![img](http://bytedance.com/logo.png)

第二段
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  describe('图片在一个段落中被文字包含', () => {
    test('上面有文本', async () => {
      const rootView = await act(() =>
        render(
          <MdBoxForTesting
            markDown={`
第一行
![img](http://bytedance.com/logo.png)
`}
            autoFixSyntax={{ autoFixEnding: false }}
          />,
        ),
      );

      expect(rootView.asFragment()).toMatchSnapshot();
    });

    test('下面有文本', async () => {
      const rootView = await act(() =>
        render(
          <MdBoxForTesting
            markDown={`
![img](http://bytedance.com/logo.png)
第二行
  `}
            autoFixSyntax={{ autoFixEnding: false }}
          />,
        ),
      );

      expect(rootView.asFragment()).toMatchSnapshot();
    });

    test('上下都有文本', async () => {
      const rootView = await act(() =>
        render(
          <MdBoxForTesting
            markDown={`
第一行
![img](http://bytedance.com/logo.png)
第二行
  `}
            autoFixSyntax={{ autoFixEnding: false }}
          />,
        ),
      );

      expect(rootView.asFragment()).toMatchSnapshot();
    });
  });

  test('图片所在段落的父节点不为根节点时（例如为块引用节点）', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
第零段

>第一段
>
>第二段第一行
>![img](http://bytedance.com/logo.png)
>第二段第二行
>
>第三段
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('自定义渲染', async () => {
    const CustomImage: FC<MdBoxImageProps> = ({ src }) => {
      return <img className="custom-image" src={src ?? ''} />;
    };

    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
![img](http://bytedance.com/logo.png)
`}
          autoFixSyntax={{ autoFixEnding: false }}
          slots={{
            Image: CustomImage,
          }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('图片未开启自适应宽度，宽高不自适应', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
<img src="http://bytedance.com/logo.png" width="50" />

<img src="http://bytedance.com/logo.png" height="70" />

<img src="http://bytedance.com/logo.png" width="50" height="70" />

<img src="http://bytedance.com/logo.png" />
`}
          autoFixSyntax={{ autoFixEnding: false }}
          enabledHtmlTags={['img']}
        />,
      ),
    );

    rootView.getAllByRole('img').forEach((img) => {
      mockImageNaturalSize(img);
      fireEvent.load(img);
    });

    await act(() => {
      rootView?.rerender;
    });

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('图片开启自适应宽度，指定一边时另一边自适应', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
<img src="http://bytedance.com/logo.png" width="50" />

<img src="http://bytedance.com/logo.png" height="70" />
`}
          autoFixSyntax={{ autoFixEnding: false }}
          enabledHtmlTags={['img']}
          imageOptions={{
            responsiveNaturalSize: true,
          }}
        />,
      ),
    );

    rootView.getAllByRole('img').forEach((img) => {
      mockImageNaturalSize(img);
      fireEvent.load(img);
    });

    await act(() => {
      rootView?.rerender;
    });

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('图片开启自适应宽度，同时指定宽高或不指定宽高时，宽高自适应', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
<img src="http://bytedance.com/logo.png" width="50" height="70" />

<img src="http://bytedance.com/logo.png" />
`}
          autoFixSyntax={{ autoFixEnding: false }}
          enabledHtmlTags={['img']}
          imageOptions={{
            responsiveNaturalSize: true,
          }}
        />,
      ),
    );

    rootView.getAllByRole('img').forEach((img) => {
      mockImageNaturalSize(img);
      fireEvent.load(img);
    });

    await act(() => {
      rootView?.rerender;
    });

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
