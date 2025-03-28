import assert from 'assert';

import { noop, range, sortBy, uniq } from 'lodash-es';
import { act, render } from '@testing-library/react';

import { rerenderWithValue } from './utils';
import { MdBoxForTesting } from '../utils';
import { SmoothOnUpdateParams } from '../..';

// eslint-disable-next-line max-lines-per-function
describe('平滑化渲染测试', () => {
  const smoothedText = '123456789012345678901234567890';

  const smoothedTextShort = '1234567890123';

  afterEach(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  test('初始有值，验证追加文字后平滑并逐字输出', async () => {
    const { result: firstRenderResult, view: firstRenderView } =
      await rerenderWithValue({
        value: smoothedText,
        interval: 30,
        loop: 50,
        mapper: (view) => view.asFragment().textContent,
        renderTarget: (value) => <MdBoxForTesting markDown={value} smooth />,
      });

    expect(firstRenderResult).toMatchSnapshot('初次更新');

    const { result: secondRenderResult } = await rerenderWithValue({
      value: `${smoothedText}${smoothedText}`,
      interval: 30,
      loop: 50,
      mapper: (view) => view.asFragment().textContent,
      view: firstRenderView,
      renderTarget: (value) => <MdBoxForTesting markDown={value} smooth />,
    });

    expect(secondRenderResult).toMatchSnapshot('二次更新');
  });

  // eslint-disable-next-line max-lines-per-function
  describe('初始有值，非追加文字的内容更新', () => {
    test('不设置 breakMode，验证将从公共前缀开始以初始速度流式输出', async () => {
      const { result: firstRenderResult, view: firstRenderView } =
        await rerenderWithValue({
          value: smoothedText,
          interval: 30,
          loop: 20,
          mapper: (view) => view.asFragment().textContent,
          renderTarget: (value) => <MdBoxForTesting markDown={value} smooth />,
        });

      const { result: secondRenderResult } = await rerenderWithValue({
        value: `${smoothedText.slice(0, 5)}abcdefghijabcdefghijabcdefghij`,
        interval: 30,
        loop: 50,
        mapper: (view) => view.asFragment().textContent,
        view: firstRenderView,
        renderTarget: (value) => <MdBoxForTesting markDown={value} smooth />,
      });

      expect([...firstRenderResult, ...secondRenderResult]).toMatchSnapshot();
    });

    test("设置 breakMode = 'prefix'，验证将从公共前缀开始以初始速度流式输出", async () => {
      const { result: firstRenderResult, view: firstRenderView } =
        await rerenderWithValue({
          value: smoothedText,
          interval: 30,
          loop: 20,
          mapper: (view) => view.asFragment().textContent,
          renderTarget: (value) => (
            <MdBoxForTesting
              markDown={value}
              smooth={{ breakMode: 'prefix' }}
            />
          ),
        });

      const { result: secondRenderResult } = await rerenderWithValue({
        value: `${smoothedText.slice(0, 5)}abcdefghijabcdefghijabcdefghij`,
        interval: 30,
        loop: 50,
        mapper: (view) => view.asFragment().textContent,
        view: firstRenderView,
        renderTarget: (value) => (
          <MdBoxForTesting markDown={value} smooth={{ breakMode: 'prefix' }} />
        ),
      });

      expect([...firstRenderResult, ...secondRenderResult]).toMatchSnapshot();
    });

    test("设置 breakMode = 'start'，验证将从最开始以初始速度流式输出", async () => {
      const { result: firstRenderResult, view: firstRenderView } =
        await rerenderWithValue({
          value: smoothedText,
          interval: 30,
          loop: 20,
          mapper: (view) => view.asFragment().textContent,
          renderTarget: (value) => (
            <MdBoxForTesting markDown={value} smooth={{ breakMode: 'start' }} />
          ),
        });

      const { result: secondRenderResult } = await rerenderWithValue({
        value: `${smoothedText.slice(0, 5)}abcdefghijabcdefghijabcdefghij`,
        interval: 30,
        loop: 50,
        mapper: (view) => view.asFragment().textContent,
        view: firstRenderView,
        renderTarget: (value) => (
          <MdBoxForTesting markDown={value} smooth={{ breakMode: 'start' }} />
        ),
      });

      expect([...firstRenderResult, ...secondRenderResult]).toMatchSnapshot();
    });

    test("设置 breakMode = 'end'，验证将从末尾以初始速度流式输出", async () => {
      const { result: firstRenderResult, view: firstRenderView } =
        await rerenderWithValue({
          value: smoothedText,
          interval: 30,
          loop: 20,
          mapper: (view) => view.asFragment().textContent,
          renderTarget: (value) => (
            <MdBoxForTesting markDown={value} smooth={{ breakMode: 'end' }} />
          ),
        });

      const secondValue = `${smoothedText.slice(
        0,
        5,
      )}abcdefghijabcdefghijabcdefghij`;

      const { result: secondRenderResult } = await rerenderWithValue({
        value: secondValue,
        interval: 30,
        loop: 10,
        mapper: (view) => view.asFragment().textContent,
        view: firstRenderView,
        renderTarget: (value) => (
          <MdBoxForTesting markDown={value} smooth={{ breakMode: 'end' }} />
        ),
      });

      const { result: thirdRenderResult } = await rerenderWithValue({
        value: `${secondValue}123451234512345123451234512345123451234512345`,
        interval: 30,
        loop: 50,
        mapper: (view) => view.asFragment().textContent,
        view: firstRenderView,
        renderTarget: (value) => (
          <MdBoxForTesting markDown={value} smooth={{ breakMode: 'end' }} />
        ),
      });

      expect([
        ...firstRenderResult,
        ...secondRenderResult,
        ...thirdRenderResult,
      ]).toMatchSnapshot();
    });
  });

  describe('设置首屏平滑阈值', () => {
    test('初始有值，长度小于阈值时流式输出', async () => {
      const { result: firstRenderResult } = await rerenderWithValue({
        value: smoothedText,
        interval: 30,
        loop: 50,
        mapper: (view) => view.asFragment().textContent,
        renderTarget: (value) => (
          <MdBoxForTesting
            markDown={value}
            smooth={{ maxFirstTextSmoothSize: 10 }}
          />
        ),
        startIndex: 5,
      });

      expect(firstRenderResult).toMatchSnapshot();
    });

    test('初始有值，长度等于阈值时流式输出', async () => {
      const { result: firstRenderResult } = await rerenderWithValue({
        value: smoothedText,
        interval: 30,
        loop: 50,
        mapper: (view) => view.asFragment().textContent,
        renderTarget: (value) => (
          <MdBoxForTesting
            markDown={value}
            smooth={{ maxFirstTextSmoothSize: 10 }}
          />
        ),
        startIndex: 10,
      });

      expect(firstRenderResult).toMatchSnapshot();
    });

    test('初始有值，长度大于阈值时直出', async () => {
      const { result: firstRenderResult } = await rerenderWithValue({
        value: smoothedText,
        interval: 30,
        loop: 50,
        mapper: (view) => view.asFragment().textContent,
        renderTarget: (value) => (
          <MdBoxForTesting
            markDown={value}
            smooth={{ maxFirstTextSmoothSize: 10 }}
          />
        ),
        startIndex: 11,
      });

      expect(firstRenderResult).toMatchSnapshot();
    });
  });

  describe('设置平滑化尾优化', () => {
    test('关闭尾优化时，平滑开关关闭时能立即渲染全部', async () => {
      const { view: firstRenderView } = await rerenderWithValue({
        value: smoothedText,
        interval: 30,
        loop: 4,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        mapper: () => {},
        renderTarget: (value) => <MdBoxForTesting markDown={value} smooth />,
      });

      expect(firstRenderView.asFragment().textContent?.trim()).not.toBe(
        smoothedText,
      );

      await act(() => {
        firstRenderView.rerender(<MdBoxForTesting markDown={smoothedText} />);
        jest.runOnlyPendingTimers();
      });

      expect(firstRenderView.asFragment().textContent?.trim()).toBe(
        smoothedText,
      );
    });

    test('开启尾优化时，平滑开关关闭时能平滑输出', async () => {
      const { view, result: firstRenderResult } = await rerenderWithValue({
        value: smoothedText,
        interval: 30,
        loop: 20,
        mapper: (view) => view.asFragment().textContent,
        renderTarget: (value) => (
          <MdBoxForTesting
            markDown={value}
            smooth={{
              enable: true,
              trailingSmooth: true,
            }}
          />
        ),
      });

      expect(view.asFragment().textContent?.trim()).not.toBe(smoothedText);

      expect(firstRenderResult).toMatchSnapshot('开关关闭之前的流式输出序列');

      const { result: secondRenderResult } = await rerenderWithValue({
        view,
        value: smoothedText,
        interval: 30,
        loop: 20,
        mapper: (view) => view.asFragment().textContent,
        renderTarget: (value) => (
          <MdBoxForTesting
            markDown={value}
            smooth={{
              enable: false,
              trailingSmooth: true,
            }}
          />
        ),
      });

      expect(view.asFragment().textContent?.trim()).toBe(smoothedText);

      expect(secondRenderResult).toMatchSnapshot('开关关闭之后的流式输出序列');
    });

    test('开启尾优化时，平滑开关始终关闭，不平滑输出，直接展示全部文本', async () => {
      const { view, result: firstRenderResult } = await rerenderWithValue({
        value: smoothedText,
        interval: 30,
        loop: 5,
        mapper: (view) => view.asFragment().textContent,
        renderTarget: (value) => (
          <MdBoxForTesting
            markDown={value}
            smooth={{
              enable: false,
              trailingSmooth: true,
            }}
          />
        ),
      });

      expect(view.asFragment().textContent?.trim()).toBe(smoothedText);

      expect(firstRenderResult).toMatchSnapshot('开关始终关闭的流式输出序列');
    });
  });

  test('流式输出完成时，调用onSmoothFinished', async () => {
    const handleSmoothFinished = jest.fn();

    const { view } = await rerenderWithValue({
      value: smoothedText,
      interval: 30,
      loop: 40,
      mapper: noop,
      renderTarget: (value: string) => (
        <MdBoxForTesting
          markDown={value}
          smooth={{
            enable: true,
            trailingSmooth: true,
            onSmoothFinished: handleSmoothFinished,
          }}
        />
      ),
    });

    /** 未流式输出完毕 */
    expect(view.asFragment().textContent?.trim()).not.toBe(smoothedText);

    expect(handleSmoothFinished).not.toHaveBeenCalled();

    await rerenderWithValue({
      view,
      value: smoothedText,
      interval: 30,
      loop: 1,
      mapper: noop,
      renderTarget: (value: string) => (
        <MdBoxForTesting
          markDown={value}
          smooth={{
            enable: false,
            trailingSmooth: true,
            onSmoothFinished: handleSmoothFinished,
          }}
        />
      ),
    });

    /** 流式输出完毕 */
    expect(view.asFragment().textContent?.trim()).toBe(smoothedText);

    expect(handleSmoothFinished).toHaveBeenCalled();
  });

  describe('设置最大流式输出速度', () => {
    let resultWithoutMaxSpeed: string[] | undefined;

    const getDiffs = (values: number[]) => {
      const diffs: number[] = [];

      for (let index = 1; index < values.length; index++) {
        diffs.push(values[index] - values[index - 1]);
      }

      return diffs;
    };

    const interval = (1000 / 60) * 2;

    const loop = 10;

    const longText = range(100)
      .map(() => smoothedText)
      .join('');

    beforeAll(async () => {
      jest.useFakeTimers();

      const { result } = await rerenderWithValue({
        value: longText,
        interval,
        loop,
        mapper: (view) => view.asFragment().textContent ?? '',
        renderTarget: (value) => <MdBoxForTesting markDown={value} smooth />,
      });

      resultWithoutMaxSpeed = result;
    });

    test.each([10, 15, 20])(
      '传入正数，验证能正确限制流式的速度',
      async (updateLengthEachInterval) => {
        const { result } = await rerenderWithValue({
          value: longText,
          interval,
          loop,
          mapper: (view) => view.asFragment().textContent ?? '',
          renderTarget: (value) => (
            <MdBoxForTesting
              markDown={value}
              smooth={{
                maxSpeed: (1000 / interval) * updateLengthEachInterval,
              }}
            />
          ),
        });

        const diffs = getDiffs(result.map((item) => item.length));

        /** 验证速度不减小 */
        expect(diffs).toStrictEqual(sortBy(diffs));

        /** 验证最大速度为指定的速度 */
        expect(Math.max(...diffs)).toBe(updateLengthEachInterval);
      },
    );

    test.each([-Infinity, -10, 0, undefined])(
      '传入负值、0或不传，则不生效',
      async (maxSpeed) => {
        const { result } = await rerenderWithValue({
          value: longText,
          interval,
          loop,
          mapper: (view) => view.asFragment().textContent ?? '',
          renderTarget: (value) => (
            <MdBoxForTesting
              markDown={value}
              smooth={{
                maxSpeed,
              }}
            />
          ),
        });

        expect(result).toStrictEqual(resultWithoutMaxSpeed);
      },
    );

    test('设置完最大速度后，再关闭速度设置，验证速度限制消失，能够平滑加速', async () => {
      const { result: resultWithMaxSpeed, view } = await rerenderWithValue({
        value: longText,
        interval,
        loop,
        mapper: (view) => view.asFragment().textContent ?? '',
        renderTarget: (value) => (
          <MdBoxForTesting
            markDown={value}
            smooth={{
              maxSpeed: (1000 / interval) * 5,
            }}
          />
        ),
      });

      const { result: resultWithoutMaxSpeed } = await rerenderWithValue({
        value: longText,
        interval,
        loop,
        view,
        mapper: (view) => view.asFragment().textContent ?? '',
        renderTarget: (value) => <MdBoxForTesting markDown={value} smooth />,
      });

      expect([...resultWithMaxSpeed, resultWithoutMaxSpeed]).toMatchSnapshot();
    });
  });

  test('暂停流式平滑化，验证暂停成功', async () => {
    const { result: firstRenderResult, view: firstRenderView } =
      await rerenderWithValue({
        value: smoothedText,
        interval: 30,
        loop: 20,
        mapper: (view) => view.asFragment().textContent,
        renderTarget: (value) => (
          <MdBoxForTesting
            markDown={value}
            smooth={{ enable: true, pause: false }}
          />
        ),
      });

    const { result: pausedResult } = await rerenderWithValue({
      view: firstRenderView,
      value: smoothedText,
      interval: 30,
      loop: 20,
      mapper: (view) => view.asFragment().textContent,
      renderTarget: (value) => (
        <MdBoxForTesting
          markDown={value}
          smooth={{ enable: true, pause: true }}
        />
      ),
    });

    const { result: continueResult } = await rerenderWithValue({
      view: firstRenderView,
      value: smoothedText,
      interval: 30,
      loop: 20,
      mapper: (view) => view.asFragment().textContent,
      renderTarget: (value) => (
        <MdBoxForTesting
          markDown={value}
          smooth={{ enable: true, pause: false }}
        />
      ),
    });

    /** 暂停时收集的帧数大于 1 */
    expect(pausedResult.length).toBeGreaterThan(1);

    /** 暂停时每帧内容没有变化 */
    expect(uniq(pausedResult)).toHaveLength(1);

    expect([
      ...firstRenderResult,
      ...pausedResult,
      ...continueResult,
    ]).toMatchSnapshot('播放 - 暂停 - 播放');
  });

  describe('流式平滑化更新回调', () => {
    test('验证 smooth.onUpdate 回调时机正确', async () => {
      const { result: renderResult } = await rerenderWithValue<
        [string | null, SmoothOnUpdateParams | undefined],
        SmoothOnUpdateParams
      >({
        value: smoothedTextShort,
        interval: 30,
        loop: 20,
        mapper: (view, interValue) => [
          view.asFragment().textContent,
          interValue,
        ],
        renderTarget: (value, callback) => (
          <MdBoxForTesting markDown={value} smooth={{ onUpdate: callback }} />
        ),
        startIndex: 5,
      });

      expect(renderResult).toHaveLength(20);

      for (let index = 1; index < renderResult.length; index++) {
        const [[prevValue], [currentValue, currentInterValue]] = [
          renderResult[index - 1],
          renderResult[index],
        ];

        if (currentValue !== prevValue) {
          expect(currentValue).not.toBeNull();

          expect(currentInterValue).not.toBeUndefined();

          assert(currentValue && currentInterValue);

          expect(currentInterValue.text).toBe(currentValue.trimEnd());

          expect(typeof currentInterValue.speed).toBe('number');
        } else {
          expect(currentInterValue).toBeUndefined();
        }
      }
    });
  });

  test('自定义弹簧算法数值，验证设置有效', async () => {
    const { result: fasterRenderResult } = await rerenderWithValue({
      value: smoothedText,
      interval: 30,
      loop: 30,
      mapper: (view) => view.asFragment().textContent,
      renderTarget: (value) => (
        <MdBoxForTesting
          markDown={value}
          smooth={{
            initialSpeed: 50 / 1000,
            expectedBufferSize: 5,
            elasticCoefficient: (1 / 700 / 1000) * 2,
          }}
        />
      ),
    });

    expect(fasterRenderResult).toMatchSnapshot(
      '增大弹性系数、减小缓冲区大小、增大初始速度的效果',
    );
  });

  describe('验证文本破坏性更新回调方法', () => {
    test('追加式更新文本，不会调用 onTextBreak', async () => {
      const handleTextBreak = jest.fn();

      const initialString = 'this is the first sentence';

      const concatenatedString =
        'this is the first sentence, and this is the second sentence';

      const view = render(
        <MdBoxForTesting
          markDown={initialString}
          smooth={{ enable: true, onTextBreak: handleTextBreak }}
        />,
      );

      await act(() => {
        jest.advanceTimersByTime(5000);

        view.rerender(
          <MdBoxForTesting
            markDown={initialString}
            smooth={{ enable: true, onTextBreak: handleTextBreak }}
          />,
        );
      });

      expect(view.asFragment().textContent?.trim()).toBe(initialString);

      view.rerender(
        <MdBoxForTesting
          markDown={concatenatedString}
          smooth={{ enable: true, onTextBreak: handleTextBreak }}
        />,
      );

      await act(() => {
        jest.advanceTimersByTime(5000);

        view.rerender(
          <MdBoxForTesting
            markDown={concatenatedString}
            smooth={{ enable: true, onTextBreak: handleTextBreak }}
          />,
        );
      });

      expect(view.asFragment().textContent?.trim()).toBe(concatenatedString);

      expect(handleTextBreak).not.toHaveBeenCalled();
    });

    test('非追加式更新文本，会调用 onTextBreak', async () => {
      const handleTextBreak = jest.fn();

      const initialString = 'this is the first sentence';

      const concatenatedString = 'this is not the first sentence';

      const view = render(
        <MdBoxForTesting
          markDown={initialString}
          smooth={{ enable: true, onTextBreak: handleTextBreak }}
        />,
      );

      await act(() => {
        jest.advanceTimersByTime(5000);

        view.rerender(
          <MdBoxForTesting
            markDown={initialString}
            smooth={{ enable: true, onTextBreak: handleTextBreak }}
          />,
        );
      });

      expect(view.asFragment().textContent?.trim()).toBe(initialString);

      view.rerender(
        <MdBoxForTesting
          markDown={concatenatedString}
          smooth={{ enable: true, onTextBreak: handleTextBreak }}
        />,
      );

      await act(() => {
        jest.advanceTimersByTime(5000);

        view.rerender(
          <MdBoxForTesting
            markDown={concatenatedString}
            smooth={{ enable: true, onTextBreak: handleTextBreak }}
          />,
        );
      });

      expect(view.asFragment().textContent?.trim()).toBe(concatenatedString);

      expect(handleTextBreak).toHaveBeenCalledWith({
        currentText: concatenatedString,
        prevText: initialString,
      });
    });
  });
});
