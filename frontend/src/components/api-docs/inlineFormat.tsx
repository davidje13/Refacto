import type { ReactNode } from 'react';
import { replaceAll } from '../../helpers/replaceAll';

const noop = (content: string) => [content];

const code = (next: (content: string) => ReactNode[]) => (content: string) =>
  replaceAll(
    content,
    /`([^`]*)`/g,
    ([_, code], key) => <code key={`c${key}`}>{code}</code>,
    next,
  );

const links = (next: (content: string) => ReactNode[]) => (content: string) =>
  replaceAll(
    content,
    /\[([^\[\]]+)\]\(([^\[\]\(\)]+)\)/g,
    ([_, text, link], key) => (
      <a key={`l${key}`} href={link} target="_blank" rel="noopener noreferrer">
        {next(text!)}
      </a>
    ),
    next,
  );

export const inlineFormat = links(code(noop));
