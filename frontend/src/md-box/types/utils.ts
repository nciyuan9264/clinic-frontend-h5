export type OmitWithType<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
