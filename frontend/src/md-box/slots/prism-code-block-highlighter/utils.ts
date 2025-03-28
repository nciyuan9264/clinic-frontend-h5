import { useEffect, useMemo, useState } from 'react';

import { languages, Languages, highlight } from 'prismjs';

let fullLanguages: Languages | null = null;

const fetchFullLanguagePacks = async () => {
  if (!fullLanguages) {
    const { default: { languages = null } = {} } = await import(
      './static/prism'
    );
    fullLanguages = languages;
  }
  return fullLanguages;
};

const useLanguagePack = (language: string) => {
  const [innerLanguages, setInnerLanguages] = useState(
    fullLanguages || languages,
  );

  const handleRefresh = async () => {
    const fetchedLanguages = await fetchFullLanguagePacks();
    if (fetchedLanguages && fetchedLanguages !== innerLanguages) {
      setInnerLanguages(fetchedLanguages);
    }
  };

  useEffect(() => {
    if (!innerLanguages[language]) {
      handleRefresh();
    }
  }, [innerLanguages, language]);

  return innerLanguages[language] || innerLanguages.plaintext;
};

export const useHighLight = (code: string, language: string) => {
  const lowerLanguage = language.toLowerCase();

  const languagePack = useLanguagePack(lowerLanguage);

  const prismCode = useMemo(() => {
    try {
      return highlight(code, languagePack, lowerLanguage);
    } catch (error) {
      /* istanbul ignore next */
      console.error('Fail to highlight code by prism', error);
      /* istanbul ignore next */
      return code;
    }
  }, [lowerLanguage, code, languagePack]);

  return prismCode;
};
