import type { FunctionComponent } from 'react';
import type { Retro, RetroItem } from '../../shared/api-entities';
import './Preview.css';

export type PreviewContent = Partial<
  Omit<Retro, 'items'> & { items: Partial<RetroItem>[]; simulatedTime: number }
>;

interface PropsT {
  content: PreviewContent;
}

export const Preview: FunctionComponent<PropsT> = ({ content }) => (
  <iframe
    className="preview"
    src={`/preview#${encodeURIComponent(JSON.stringify(content))}`}
    role="figure"
    loading="lazy"
  />
);
