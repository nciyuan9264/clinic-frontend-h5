/// <reference types="react" />
type UseIntersectionObserverInit = Pick<IntersectionObserverInit, 'rootMargin' | 'root'>;
type UseIntersection = {
    disabled?: boolean;
} & UseIntersectionObserverInit & {
    rootRef?: React.RefObject<HTMLElement> | null;
};
/**
 *
 * @param {UseIntersection} param
 * @param {React.RefObject<HTMLElement> | null} param.rootRef 根元素ref，即目标元素所在容器节点
 * @param {string | undefined} param.rootMargin 根元素margin
 * @param {boolean | undefined} param.disable 是否禁用懒加载
 */
declare const useIntersection: <T extends Element>({ rootRef, rootMargin, disabled, }: UseIntersection) => [(element: T | null) => void, boolean, () => void];
export default useIntersection;
