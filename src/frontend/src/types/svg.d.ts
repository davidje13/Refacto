declare module '*.svg' {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement> | { title?: string }>;
  const content: string;

  export { ReactComponent };
  export default content;
}
