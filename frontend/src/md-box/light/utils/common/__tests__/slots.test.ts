import { transformEach, applyInsertListToString } from '../slots';

describe('测试操作的转换（transformEach）', () => {
  test('多个操作的转换', () => {
    const result = transformEach([
      { replaceRange: [5, 5], insert: '{insert\\_element\\_0\\_}', index: 0 },
      { replaceRange: [3, 3], insert: '{insert\\_element\\_1\\_}', index: 1 },
      { replaceRange: [7, 7], insert: '{insert\\_element\\_2\\_}', index: 2 },
    ]);

    expect(result).toStrictEqual([
      {
        replaceRange: [5, 5],
        insert: '{insert\\_element\\_0\\_}',
        index: 0,
      },
      {
        replaceRange: [3, 3],
        insert: '{insert\\_element\\_1\\_}',
        index: 1,
      },
      {
        replaceRange: [51, 51],
        insert: '{insert\\_element\\_2\\_}',
        index: 2,
      },
    ]);
  });
});

describe('将标签嵌入到字符串中（applyInsertListToString）', () => {
  test('普通插入', () => {
    const result = applyInsertListToString(
      '123456789|123456789|123456789|123456789|123456789|123456789|123456789|123456789|123456789|',
      [
        {
          range: 5,
          render: () => undefined,
        },
        {
          range: 3,
          render: () => undefined,
        },
        {
          range: 7,
          render: () => undefined,
        },
        {
          range: [22, 27],
          render: () => undefined,
        },
        {
          range: [16, 18],
          render: () => undefined,
        },
        {
          range: [25, 35],
          render: () => undefined,
        },
      ],
    );

    expect(result).toBe(
      '123{insert\\_element\\_1\\_}45{insert\\_element\\_0\\_}67{insert\\_element\\_2\\_}89|123456{insert\\_element\\_4\\_Nzg=}9|12{insert\\_element\\_3\\_MzQ1Njc=}{insert\\_element\\_5\\_Njc4OXwxMjM0NQ==}6789|123456789|123456789|123456789|123456789|123456789|',
    );
  });

  describe('过滤合法区间', () => {
    test('当区间开始小于字符串长度时，插入', () => {
      expect(
        applyInsertListToString('123456789|123456789|', [
          {
            range: [10, 12],
            render: () => undefined,
          },
        ]),
      ).toBe('123456789|{insert\\_element\\_0\\_MTI=}3456789|');
    });

    test('当区间开始等于字符串长度时，插入', () => {
      expect(
        applyInsertListToString('123456789|123456789|', [
          {
            range: [20, 22],
            render: () => undefined,
          },
        ]),
      ).toBe('123456789|123456789|{insert\\_element\\_0\\_}');

      expect(
        applyInsertListToString('123456789|123456789|', [
          {
            range: [10, 12],
            render: () => undefined,
          },
          {
            range: [20, 22],
            render: () => undefined,
          },
        ]),
      ).toBe(
        '123456789|{insert\\_element\\_0\\_MTI=}3456789|{insert\\_element\\_1\\_}',
      );
    });

    test('当区间开始大于字符串长度时，插入', () => {
      expect(
        applyInsertListToString('123456789|123456789|', [
          {
            range: [21, 23],
            render: () => undefined,
          },
        ]),
      ).toBe('123456789|123456789|');

      expect(
        applyInsertListToString('123456789|123456789|', [
          {
            range: [10, 12],
            render: () => undefined,
          },
          {
            range: [21, 23],
            render: () => undefined,
          },
        ]),
      ).toBe('123456789|{insert\\_element\\_0\\_MTI=}3456789|');

      expect(
        applyInsertListToString('123456789|123456789|', [
          {
            range: [10, 12],
            render: () => undefined,
          },
          {
            range: [28, 32],
            render: () => undefined,
          },
          {
            range: [21, 23],
            render: () => undefined,
          },
        ]),
      ).toBe('123456789|{insert\\_element\\_0\\_MTI=}3456789|');
    });
  });
});
