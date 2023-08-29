declare module '*.svg' {
  const ReactComponent: React.FC<
    React.SVGProps<SVGSVGElement> | { title?: string }
  >;

  export default ReactComponent;
}
