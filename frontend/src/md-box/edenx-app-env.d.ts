/// <reference types='@edenx/module-tools/types' />
/// <reference types='@testing-library/jest-dom/types' />

declare module '*.svg' {
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

  export default ReactComponent;
}
