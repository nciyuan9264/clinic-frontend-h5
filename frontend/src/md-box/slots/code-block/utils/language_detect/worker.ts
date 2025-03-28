import hljs from 'highlight.js';

import {
  EventSession,
  LanguageDetectEventData,
  LanguageDetectEventReturnData,
} from './type';

const detectLanguageByCode = (code: string) => {
  const { language } = hljs.highlightAuto(code);
  return language;
};

self.onmessage = ({
  data,
}: MessageEvent<EventSession<LanguageDetectEventData>>) => {
  const {
    session,
    data: { code },
  } = data;

  const returnData: EventSession<LanguageDetectEventReturnData> = {
    session,
    data: {
      language: detectLanguageByCode(code),
    },
  };

  self.postMessage(returnData);
};
