/* eslint-disable import/unambiguous */

declare module '*.svg' {
  const ReactComponent: React.FunctionComponent<
    React.SVGAttributes<SVGElement>
  >;

  export default ReactComponent;
}
