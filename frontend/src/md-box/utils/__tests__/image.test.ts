import { defaults } from 'lodash-es';

import { resizeImage } from '../image';

describe('图片响应式大小缩放测试', () => {
  const resizeTest = (
    props: Partial<Parameters<typeof resizeImage>[0]>,
    height: number,
    width: number,
  ) => {
    const actualProps = defaults(props, {
      height: 150,
      width: 100,
      minHeight: 0,
      minWidth: 0,
      maxHeight: 400,
      maxWidth: 400,
    });
    const size = resizeImage(actualProps);
    expect(size.height).toBeCloseTo(height, 1);
    expect(size.width).toBeCloseTo(width, 1);
    return size;
  };

  test('图片大小适中，不需要任何缩放', () => {
    resizeTest({}, 150, 100);
  });

  test('图片长度过小', () => {
    resizeTest(
      {
        minWidth: 150,
      },
      225,
      150,
    );
  });

  test('图片长度过大', () => {
    resizeTest(
      {
        maxWidth: 50,
      },
      75,
      50,
    );
  });

  test('图片高度过小', () => {
    resizeTest(
      {
        minHeight: 200,
      },
      200,
      133.33,
    );
  });

  test('图片高度过大', () => {
    resizeTest(
      {
        maxHeight: 100,
      },
      100,
      66.66,
    );
  });

  test('宽高不限', () => {
    resizeTest(
      {
        height: 1000,
        maxHeight: Number.MAX_SAFE_INTEGER,
      },
      1000,
      100,
    );
    resizeTest(
      {
        width: 1000,
        maxWidth: Number.MAX_SAFE_INTEGER,
      },
      150,
      1000,
    );
  });

  test('特殊情况处理', () => {
    resizeTest(
      {
        minWidth: 300,
        maxHeight: 200,
      },
      200,
      133.33,
    );
    resizeTest(
      {
        minHeight: 300,
        maxWidth: 150,
      },
      225,
      150,
    );
    resizeTest(
      {
        maxWidth: 50,
        minWidth: 100,
      },
      75,
      50,
    );
    resizeTest(
      {
        maxHeight: 50,
        minHeight: 100,
      },
      50,
      33.33,
    );
  });
});
