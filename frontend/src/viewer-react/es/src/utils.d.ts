import { LocalStorageKeys } from './constants';
interface StaticImageData {
    src: string;
    height: number;
    width: number;
}
interface StaticRequire {
    default: StaticImageData;
}
interface LocalStorageData {
    [LocalStorageKeys.SupportWebp]: boolean;
    [LocalStorageKeys.SupportAvif]: boolean;
    [LocalStorageKeys.UA]: string;
}
type StaticImport = StaticRequire | StaticImageData;
type ProtocolType = 'http:' | 'https:';
export declare const isStaticRequire: (src: StaticRequire | StaticImageData) => src is StaticRequire;
export declare const isStaticImageData: (src: StaticRequire | StaticImageData) => src is StaticImageData;
export declare const isStaticImport: (src: string | StaticImport) => src is StaticImport;
export declare const isImagexUrl: (url: string) => boolean;
export declare const isTosUrl: (url: string) => boolean;
export declare const isHttpUrl: (url: string) => boolean;
export declare const parseImagexUrl: (url: string) => {
    src: string;
    protocol: ProtocolType;
    domain: string;
    suffix: string;
    template: string;
    search: string;
    templateWithoutParams: string;
    params: string[];
};
export declare const parseOtherUrl: (url: string) => {
    src: string;
    protocol: ProtocolType;
    domain: string;
    search: string;
};
export declare const isSSR: () => boolean;
export declare const supportLocalstorage: () => boolean;
export declare function getLocalStorage<T extends LocalStorageData, K extends keyof T>(key: K): T[K] | null;
export declare function setLocalStorage<T extends LocalStorageData, K extends keyof T>(key: K, value: T[K]): boolean;
export declare const browserUserAgent: string;
export declare const isSafari: (ssrUa?: string) => boolean;
export declare const isFirefox: (ssrUa?: string) => boolean;
export declare const safeBtoa: (str: string) => string;
export {};
