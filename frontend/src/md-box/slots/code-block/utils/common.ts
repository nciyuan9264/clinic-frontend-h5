import { useEffect, useState } from 'react';

import { detectLanguage } from './language_detect';

const PLAIN_TEXT = 'plaintext';

export const useAutoDetectLanguage = (
  code: string,
  currentLanguage = PLAIN_TEXT,
) => {
  const [innerLanguage, setInnerLanguage] = useState(currentLanguage);

  const handleAutoDelectLanguage = async () => {
    if (innerLanguage === PLAIN_TEXT) {
      const delected = await detectLanguage(code);
      /* istanbul ignore if */
      if (delected) {
        setInnerLanguage(delected);
      }
    }
  };

  useEffect(() => {
    setInnerLanguage(currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    handleAutoDelectLanguage();
  }, [code, innerLanguage]);

  return innerLanguage;
};
