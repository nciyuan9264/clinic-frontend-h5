import React, { FC, useEffect, useRef, useState } from 'react';

import { RawMathjaxTex, texToSvg } from '../mathjax-tex';
import { MdBoxTexProps } from '../../contexts';

export const AsyncLazyMathJaxTex: FC<MdBoxTexProps> = ({
  className,
  style,

  tex,
}) => {
  const [svgString, setSvgString] = useState<string>();

  const [startCalculate, setStartCalculate] = useState(false);

  const texRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (startCalculate) {
      setSvgString(texToSvg(tex));
    }
  }, [tex, startCalculate]);

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver((entries) => {
      if (!entries?.[0]) {
        return;
      }

      const { intersectionRatio } = entries[0];

      if (intersectionRatio > 0) {
        setStartCalculate(true);

        intersectionObserver.disconnect();
      }
    });

    if (texRef.current) {
      intersectionObserver.observe(texRef.current);
    }

    return () => {
      intersectionObserver.disconnect();
    };
  }, []);

  return (
    <RawMathjaxTex
      ref={texRef}
      className={className}
      style={style}
      tex={tex}
      html={svgString}
    />
  );
};

export default AsyncLazyMathJaxTex;
