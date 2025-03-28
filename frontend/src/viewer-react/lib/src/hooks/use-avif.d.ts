/**
 *
 * @param { boolean } param0 是否禁用AVIF
 * @returns { boolean[] } 是否支持AVIF
 */
declare const useAvif: (disable?: boolean) => (boolean | undefined)[];
export default useAvif;
