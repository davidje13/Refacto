// https://github.com/neutrinojs/neutrino/issues/1650

declare module '*.svgr' {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement> | { title?: string }>;
  const content: string;

  export { ReactComponent };
  export default content;
}
