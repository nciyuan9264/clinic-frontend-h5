import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';

describe('自动适配RTL方向渲染测试', () => {
  test('开启autoFitRTL时当内容某次更新判定为RTL语言时，则切换RTL方式布局', async () => {
    const rootView = await act(() =>
      render(<MdBoxForTesting markDown={'english prefix'} autoFitRTL />),
    );

    let prevFragment = rootView.asFragment();

    await act(() => {
      rootView.rerender(
        <MdBoxForTesting
          markDown={'english prefixاد الروبوت غير متاح وغير قادر على إرسال'}
          autoFitRTL
        />,
      );
    });

    expect(prevFragment).toMatchDiffSnapshot(
      (prevFragment = rootView.asFragment()),
      {},
      '变成RTL语言',
    );

    await act(() => {
      rootView.rerender(
        <MdBoxForTesting markDown={'english prefix'} autoFitRTL />,
      );
    });

    expect(prevFragment).toMatchDiffSnapshot(
      (prevFragment = rootView.asFragment()),
      {},
      '变回LTR语言',
    );
  });

  test('不开启autoFitRTL时永远不自动切换RTL方式布局', async () => {
    const rootView = await act(() =>
      render(<MdBoxForTesting markDown={'english prefix'} />),
    );

    const prevFragment = rootView.asFragment();

    await act(() => {
      rootView.rerender(
        <MdBoxForTesting
          markDown={'english prefixاد الروبوت غير متاح وغير قادر على إرسال'}
        />,
      );
    });

    expect(prevFragment).toMatchDiffSnapshot(rootView.asFragment());
  });

  test('取消开关支持二次渲染', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={'english prefixاد الروبوت غير متاح وغير قادر على إرسال'}
          autoFitRTL
        />,
      ),
    );

    let prevFragment = rootView.asFragment();

    await act(() => {
      rootView.rerender(
        <MdBoxForTesting
          markDown={'english prefixاد الروبوت غير متاح وغير قادر على إرسال'}
        />,
      );
    });

    expect(prevFragment).toMatchDiffSnapshot(
      (prevFragment = rootView.asFragment()),
    );
  });
});
