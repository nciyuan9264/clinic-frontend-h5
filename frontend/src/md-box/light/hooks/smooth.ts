import { useEffect, useRef, useState } from 'react';

import { defaults, isBoolean, isNumber, isString } from 'lodash-es';
import { useInterval } from 'ahooks';

import {
  useEstablished,
  useForceUpdate,
  useLatestFunction,
  usePreviousRef,
} from './common';

const INITIAL_SPEED = 20 / 1000;

const EXPECTED_BUFFER_SIZE = 15;

const ELASTIC_COEFFICIENT = 1 / 700 / 1000;

const TICK_DURATION = (1000 / 60) * 2;

const findCommonPrefixLength = (first: string, second: string) => {
  let leftIndex = 0;
  let rightIndex = Math.max(first.length, second.length);

  while (leftIndex !== rightIndex && leftIndex !== rightIndex - 1) {
    const midIndex = Math.floor((leftIndex + rightIndex) / 2);

    // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
    if (first.slice(0, midIndex) === second.slice(0, midIndex)) {
      leftIndex = midIndex;
    } else {
      rightIndex = midIndex;
    }
  }

  return leftIndex;
};

export interface SmoothOnUpdateParams {
  /**
   * 当前输出的文本
   */
  text: string;
  /**
   * 当前输出速度，单位：字 / 秒
   */
  speed: number;
}

export interface SmoothOnTextBreakParams {
  /**
   * 破坏性更新之前的文本
   */
  prevText: string;
  /**
   * 破坏性更新之后的文本
   */
  currentText: string;
}

export interface SmoothOptions {
  /**
   * 是否开启流式输出平滑化
   * @default true
   */
  enable?: boolean;
  /**
   * 当传入此值时，启用首屏文本直出（不开启平滑）的功能，此值代表当首屏文本不大于多少时从1字开始
   * 平滑输出，否则以该文本为起始进度，第二次更新再继续平滑输出
   *
   * 不传代表任意时刻都启用平滑化
   *
   * 例如，当传入值为5时：
   * - 首次传入文本为abc，则abc从空平滑化输出
   * - 首次传入文本为abcdef，则abcdef首屏直接展示，不平滑化输出
   *
   * 本功能应用场景为：当流式输出一半时切出，假如不开启此功能，再切回会从空串重新开始平滑，开启时
   * 能自动以超过指定长度的首文本作为起始进度
   * @default Infinity
   */
  maxFirstTextSmoothSize?: number;
  /**
   * 启动平滑化尾优化。开启时，当enable从true变为false时，会以更快的速度平滑化输出到文本结束，关闭时当enable变为false时，则会直接输出全文
   * 默认为false
   * @default false
   */
  trailingSmooth?: boolean;
  /**
   * 暂停流式动画
   * @default false
   */
  pause?: boolean;
  /**
   * 开启平滑化时的实际渲染完成回调，用于获取真实结束时间
   */
  onSmoothFinished?: () => void;
  /**
   * 平滑后的内容更新时回调
   */
  onUpdate?: (params: SmoothOnUpdateParams) => void;
  /**
   * 文本破坏性更新回调，破坏性更新指前面的文本非最新文本的前缀，因此无法再继续平滑化，上屏内容
   * 需要立即重置为最新的文本
   */
  onTextBreak?: (params: SmoothOnTextBreakParams) => void;
  /**
   * 流式平滑最大的速度，单位：字符 / 秒
   * @default Infinity
   */
  maxSpeed?: number;
  /**
   * 弹簧平衡位置（即预期剩余缓冲区长度），单位：字符
   * @default 15
   */
  expectedBufferSize?: number;
  /**
   * 系数（弹性系数/质量），数值越大，则跟随内容越及时、平顺性越低
   * @default 1/700/1000
   */
  elasticCoefficient?: number;
  /**
   * 最小更新时间间隔，数值越小，动画播放越快，单位：毫秒
   * @default 100/3
   */
  tickDuration?: number;
  /**
   * 初始速度，单位：字符 / 秒
   * @default 20/1000
   */
  initialSpeed?: number;
  /**
   * 当出现文本破坏式更新时（非拼接式更新），如何重置光标位置
   * - prefix: 重置到公共前缀
   * - end: 重置到文本末尾
   * - start: 重置到文本开头
   * @default 'prefix'
   */
  breakMode?: 'prefix' | 'end' | 'start';
}

export interface UseSmoothTextReturnValue {
  text: string;
  /** 将游标设置到当前文本末尾处 */
  flushCursor: () => void;
}

// eslint-disable-next-line max-lines-per-function
export const useSmoothText = (
  text: string,
  smoothConfig: boolean | SmoothOptions = {},
): UseSmoothTextReturnValue => {
  const {
    maxFirstTextSmoothSize,
    trailingSmooth,
    enable,
    pause,
    onSmoothFinished,
    onUpdate,
    onTextBreak,
    maxSpeed: _maxSpeed,
    expectedBufferSize,
    elasticCoefficient,
    tickDuration,
    initialSpeed,
    breakMode,
  } = defaults(isBoolean(smoothConfig) ? {} : { ...smoothConfig }, {
    maxFirstTextSmoothSize: Infinity,
    trailingSmooth: false,
    pause: false,
    enable: Boolean(smoothConfig),
    expectedBufferSize: EXPECTED_BUFFER_SIZE,
    elasticCoefficient: ELASTIC_COEFFICIENT,
    tickDuration: TICK_DURATION,
    initialSpeed: INITIAL_SPEED,
    breakMode: 'prefix',
  });

  const maxSpeed = isNumber(_maxSpeed) && _maxSpeed > 0 ? _maxSpeed : Infinity;

  const prevTextRef = usePreviousRef(text);

  const currentPosition = useRef(
    text.length <= maxFirstTextSmoothSize ? 1 : text.length,
  );

  const indexRef = useRef(currentPosition.current);

  const hasEnable = useEstablished(enable);

  // 最开始为 false 的时候不要流式，只有 enable 从 true 变为 false 的时候才要结尾优化一下
  const running =
    enable ||
    (hasEnable && trailingSmooth && currentPosition.current < text.length);

  const [isAtEnding, setIsAtEnding] = useState(false);

  const currentSpeed = useRef(initialSpeed);

  const isAtBreak = () => {
    return (
      isString(prevTextRef.current) && !text.startsWith(prevTextRef.current)
    );
  };

  /** 如下代码要实现发现文本破坏式更新时，同步地更新下标，使得内容和下标更新同步 */
  if (isAtBreak()) {
    let initialPosition = 0;

    if (breakMode === 'start') {
      initialPosition = 0;
    } else if (breakMode === 'end') {
      initialPosition = Math.max(text.length - 1, 0);
    } else if (breakMode === 'prefix') {
      initialPosition = Math.max(
        1,
        findCommonPrefixLength(prevTextRef.current ?? '', text),
      );
    }

    currentPosition.current = initialPosition;

    indexRef.current = Math.floor(currentPosition.current);
  }

  const index = indexRef.current;

  const currentText = running && !isAtEnding ? text.slice(0, index) : text;

  const handleForceUpdate = useForceUpdate();

  const setIndex = (newIndex: number) => {
    if (newIndex === indexRef.current) {
      return;
    }

    indexRef.current = newIndex;

    handleForceUpdate();
  };

  const handleFlushCursor = useLatestFunction(() => {
    setIsAtEnding(true);
  });

  useEffect(() => {
    if (isAtEnding) {
      setIndex(text.length);

      setIsAtEnding(false);

      currentPosition.current = text.length;
    }
  }, [isAtEnding]);

  useEffect(() => {
    if (!running) {
      onSmoothFinished?.();
    }
  }, [running]);

  useInterval(
    () => {
      if (!isAtBreak()) {
        const endPosition = Math.max(
          text.length +
            (!enable && trailingSmooth ? 2 * expectedBufferSize : 0),
          expectedBufferSize * 2,
        );

        const restSpace = endPosition - currentPosition.current;

        const balanceDistance = restSpace - expectedBufferSize;

        const acceleration = elasticCoefficient * balanceDistance;

        currentSpeed.current = Math.min(
          Math.max(0, currentSpeed.current + tickDuration * acceleration),
          /** 从“字/每秒”换算为“字/毫秒” */
          maxSpeed / 1000,
        );

        const diffPosition = tickDuration * currentSpeed.current;

        currentPosition.current = Math.min(
          text.length,
          currentPosition.current + diffPosition,
        );

        setIndex(Math.floor(currentPosition.current));
      } else {
        onTextBreak?.({
          prevText: prevTextRef.current ?? '',
          currentText: text,
        });

        currentSpeed.current = initialSpeed;

        prevTextRef.current = undefined;
      }
    },
    running && !pause ? tickDuration : undefined,
  );

  useEffect(() => {
    onUpdate?.({
      text: currentText,
      speed: currentSpeed.current * 1000,
    });
  }, [index]);

  return {
    text: currentText,
    flushCursor: handleFlushCursor,
  };
};
