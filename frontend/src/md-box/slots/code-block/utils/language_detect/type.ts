export interface EventSession<T> {
  session: string;
  data: T;
}

export interface LanguageDetectEventData {
  code: string;
}

export interface LanguageDetectEventReturnData {
  language?: string;
}
