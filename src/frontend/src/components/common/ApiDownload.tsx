import React, { useState, useCallback, memo } from 'react';
import { API_BASE } from '../../api/api';
import './ApiDownload.less';

interface PropsT {
  url: string;
  token: string | null;
  filename: string;
  children: React.ReactChild;
}

export default memo(({ url, token, filename, children }: PropsT) => {
  // Thanks, https://stackoverflow.com/a/43133108/1180785

  const [pending, setPending] = useState(false);

  const handleDownload = useCallback(
    async (e: React.SyntheticEvent) => {
      e.preventDefault();
      if (pending) {
        return;
      }
      setPending(true);
      try {
        const result = await fetch(`${API_BASE}/${url}`, {
          headers: { Authorization: `Bearer ${token}` },
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
    },
    [url, token, filename, pending, setPending],
  );

  if (pending || !token) {
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
});
