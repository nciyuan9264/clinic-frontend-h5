import { LayoutValues, ValidFormat, DynamicFormat } from './constants';
import { ReactNode } from 'react';
interface StaticImageData {
    src: string;
    height: number;
    width: number;
}
interface StaticRequire {
    default: StaticImageData;
}
export type StaticImport = StaticRequire | StaticImageData;
export type ProtocolType = 'http:' | 'https:';
export type ImageLoaderProps = {
    src: string;
    width: number;
    quality: number;
    format: string;
    extra: {
        domain?: string;
        protocol?: ProtocolType;
        template?: string;
        templateWithoutParams?: string;
        params?: string[];
        suffix?: string;
        search?: string;
        origin: string;
    };
};
export type ImageLoader = (props: ImageLoaderProps) => string;
export type LayoutType = typeof LayoutValues[number];
export type ImgElementStyle = NonNullable<JSX.IntrinsicElements['img']['style']>;
export type ImgElementWithDataProp = HTMLImageElement & {
    'loaded-src'?: string;
};
export type PlaceholderValue = 'skeleton' | 'empty' | string;
export type OnLoadingComplete = (result: {
    naturalWidth: number;
    naturalHeight: number;
}) => void;
export type ViewerProps = Omit<JSX.IntrinsicElements['img'], 'src' | 'width' | 'height' | 'loading' | 'srcSet' | 'ref'> & {
    width?: number;
    height?: number;
    src: string | StaticImport;
    layout?: LayoutType;
    loader?: ImageLoader;
    loading?: 'lazy' | 'eager';
    placeholder?: PlaceholderValue;
    quality?: number;
    formats?: typeof ValidFormat[number][];
    imageSizes?: number[];
    unoptimized?: boolean;
    lazyRoot?: React.RefObject<HTMLElement> | null;
    lazyBoundary?: string;
    errorDataURL?: string;
    error?: ReactNode;
    ssr?: boolean;
    ua?: string;
    objectFit?: ImgElementStyle['objectFit'];
    objectPosition?: ImgElementStyle['objectPosition'];
    onLoadingComplete?: OnLoadingComplete;
};
export type ImageElementProps = Omit<ViewerProps, 'src' | 'loader' | 'imageSizes'> & {
    src: string;
    srcString: string;
    loader: ImageLoader;
    imageSizes: number[];
    placeholderStyle: ImgElementStyle;
    isVisible: boolean;
    setPlaceholderComplete: (b: boolean) => void;
    setTarget: (img: HTMLImageElement | null) => void;
    imgStyle: JSX.IntrinsicElements['img']['style'];
    onLoadingCompleteRef: React.MutableRefObject<OnLoadingComplete | undefined>;
    loadedImageURLsRef: React.MutableRefObject<Set<string>>;
    wrapperElement: React.RefObject<HTMLElement>;
    supportWebP: boolean | undefined;
    supportAVIF: boolean | undefined;
};
export type ImgSourceParams = {
    src: string;
    srcSet?: string;
    sizes?: string;
};
export type GenImgSourceProps = {
    src: string;
    unoptimized?: boolean;
    layout?: LayoutType;
    loader: ImageLoader;
    imageSizes: number[];
    quality: number;
    width: number | undefined;
    height: number | undefined;
    sizes?: string;
    format?: typeof DynamicFormat[number] | 'jpeg' | 'png';
    wrapperElement: React.RefObject<HTMLElement>;
    ssr?: boolean;
};
export {};
