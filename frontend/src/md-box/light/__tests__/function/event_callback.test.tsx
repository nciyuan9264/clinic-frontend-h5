import { render, act, fireEvent } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';
import { ImageStatus } from '../../../contexts';

// eslint-disable-next-line max-lines-per-function
describe('事件回调测试', () => {
  test('发送消息回调测试', async () => {
    const handleSendMessage = jest.fn();

    const testMessageContent = '测试消息内容';

    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
点击[发送消息](coco://sendMessage?msg=${encodeURIComponent(
            testMessageContent,
          )}&conversation_id=17010432)
  `}
          eventCallbacks={{
            onSendMessage: handleSendMessage,
          }}
        />,
      ),
    );

    fireEvent.click(
      rootView.getByText('发送消息', {
        selector: 'a',
      }),
    );

    expect(handleSendMessage).toHaveBeenCalledTimes(1);

    expect(handleSendMessage).toHaveBeenCalledWith(testMessageContent);
  });

  describe('wiki点击测试', () => {
    test.each(['http', 'https'])('合法wiki链接', async (protocol) => {
      const legalLink = `coco://sendMessage?msg=666&ext=${encodeURIComponent(
        JSON.stringify({
          onboarding_big_profile: 0,
          onboarding_v2: 0,
          s$wiki_link: `${protocol}://bytedance.com`,
          search_engine_type: 0,
          search_view: false,
          msg_template_id: 0,
        }),
      )}`;

      const handleSendMessage = jest.fn();

      const handleLinkClick = jest.fn();

      const rootView = await act(() =>
        render(
          <MdBoxForTesting
            markDown={`
点击[跳转 wiki](${legalLink})
  `}
            eventCallbacks={{
              onSendMessage: handleSendMessage,
              onLinkClick: handleLinkClick,
            }}
          />,
        ),
      );

      fireEvent.click(
        rootView.getByText('跳转 wiki', {
          selector: 'a',
        }),
      );

      expect(handleSendMessage).toHaveBeenCalledTimes(0);

      expect(handleLinkClick).toHaveBeenCalledTimes(1);

      expect(handleLinkClick).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          exts: { wiki_link: `${protocol}://bytedance.com`, type: 'wiki' },
          parsedUrl: expect.any(URL),
          url: legalLink,
        }),
      );
    });

    test('不合法链接', async () => {
      const illegalLink = `coco://sendMessage?msg=666&ext=${encodeURIComponent(
        JSON.stringify({
          onboarding_big_profile: 0,
          onboarding_v2: 0,
          s$wiki_link: 'JavaScript:alert(document.cookie)',
          search_engine_type: 0,
          search_view: false,
          msg_template_id: 0,
        }),
      )}`;

      const handleSendMessage = jest.fn();

      const handleLinkClick = jest.fn();

      const rootView = await act(() =>
        render(
          <MdBoxForTesting
            markDown={`
点击[跳转 wiki](${illegalLink})
  `}
            eventCallbacks={{
              onSendMessage: handleSendMessage,
              onLinkClick: handleLinkClick,
            }}
          />,
        ),
      );

      fireEvent.click(
        rootView.getByText('跳转 wiki', {
          selector: 'a',
        }),
      );

      expect(handleSendMessage).toHaveBeenCalledTimes(0);

      expect(handleLinkClick).toHaveBeenCalledTimes(0);
    });
  });

  describe('链接点击回调测试', () => {
    test.each(['http', 'https'])(
      '合法链接（http和https）',
      async (protocol) => {
        const handleLinkClick = jest.fn();

        const rootView = await act(() =>
          render(
            <MdBoxForTesting
              markDown={`
  点击[链接跳转](${protocol}://bytedance.com)
    `}
              eventCallbacks={{
                onLinkClick: handleLinkClick,
              }}
            />,
          ),
        );

        fireEvent.click(
          rootView.getByText('链接跳转', {
            selector: 'a',
          }),
        );

        expect(handleLinkClick).toHaveBeenCalledTimes(1);

        expect(handleLinkClick).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            exts: { type: 'normal' },
            parsedUrl: expect.any(URL),
            url: `${protocol}://bytedance.com`,
          }),
        );
      },
    );

    test('不合法链接', async () => {
      const handleLinkClick = jest.fn();

      const rootView = await act(() =>
        render(
          <MdBoxForTesting
            markDown={`
  点击[链接跳转](test://bytedance.com)
    `}
            eventCallbacks={{
              onLinkClick: handleLinkClick,
            }}
          />,
        ),
      );

      fireEvent.click(
        rootView.getByText('链接跳转', {
          selector: 'a',
        }),
      );

      expect(handleLinkClick).toHaveBeenCalledTimes(0);
    });
  });

  test('图片点击回调测试', async () => {
    const handleImageClick = jest.fn();

    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
点击![图片](https://bytedance.com/logo.png)
  `}
          eventCallbacks={{
            onImageClick: handleImageClick,
          }}
        />,
      ),
    );

    fireEvent.click(rootView.getByAltText('image'));

    expect(handleImageClick).toHaveBeenCalledTimes(1);

    expect(handleImageClick).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        src: 'https://bytedance.com/logo.png',
        status: ImageStatus.Loading,
      }),
    );
  });

  test('链接顺序挂载回调测试', async () => {
    const handleLinkRender = jest.fn();

    await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
[链接跳转1](https://bytedance.com/1)
[链接跳转2](https://bytedance.com/2)
[链接跳转3](https://bytedance.com/3)
`}
          eventCallbacks={{
            onLinkRender: handleLinkRender,
          }}
        />,
      ),
    );

    expect(handleLinkRender).toHaveBeenCalledTimes(3);

    expect(handleLinkRender).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        parsedUrl: expect.any(URL),
        url: 'https://bytedance.com/1',
      }),
    );
    expect(handleLinkRender).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        parsedUrl: expect.any(URL),
        url: 'https://bytedance.com/2',
      }),
    );
    expect(handleLinkRender).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        parsedUrl: expect.any(URL),
        url: 'https://bytedance.com/3',
      }),
    );
  });

  test('图片顺序挂载回调测试', async () => {
    const handleImageRender = jest.fn();

    await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
![图片1](https://bytedance.com/logo1.png)
![图片2](https://bytedance.com/logo2.png)
![图片3](https://bytedance.com/logo3.png)
`}
          eventCallbacks={{
            onImageRender: handleImageRender,
          }}
        />,
      ),
    );

    expect(handleImageRender).toHaveBeenCalledTimes(3);

    expect(handleImageRender).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        src: 'https://bytedance.com/logo1.png',
        status: ImageStatus.Loading,
      }),
    );
    expect(handleImageRender).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        src: 'https://bytedance.com/logo2.png',
        status: ImageStatus.Loading,
      }),
    );
    expect(handleImageRender).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        src: 'https://bytedance.com/logo3.png',
        status: ImageStatus.Loading,
      }),
    );
  });
});
