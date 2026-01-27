import { useState, memo, type ReactNode, type SyntheticEvent } from 'react';
import type { RetroAuth } from '../../shared/api-entities';
import { useEvent } from '../../hooks/useEvent';
import { API_BASE } from '../../api/api';
import './ApiDownload.css';

interface PropsT {
  url: string;
  retroAuth: RetroAuth;
  filename: string;
  children: ReactNode;
}

export const ApiDownload = memo(
  ({ url, retroAuth, filename, children }: PropsT) => {
    // Thanks, https://stackoverflow.com/a/43133108/1180785

    const [pending, setPending] = useState(false);

    const handleDownload = useEvent(async (e: SyntheticEvent) => {
      e.preventDefault();
      if (pending) {
        return;
      }
      setPending(true);
      try {
        const result = await fetch(`${API_BASE}/${url}`, {
          headers: { Authorization: `Bearer ${retroAuth.retroToken}` },
        });
        const blob = await result.blob();
        const blobUrl = URL.createObjectURL(blob);
        try {
          const link = document.createElement('a');
          link.setAttribute('href', blobUrl);
          link.setAttribute('download', filename);
          link.click();
        } finally {
          URL.revokeObjectURL(blobUrl);
        }
      } finally {
        setPending(false);
      }
    });

    if (pending) {
      return <span className="api-download">{children}</span>;
    }

    return (
      <a
        className="api-download"
        href={url}
        download={filename}
        onClick={handleDownload}
      >
        {children}
      </a>
    );
  },
);
