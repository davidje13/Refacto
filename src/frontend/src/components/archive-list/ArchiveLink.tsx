import React, { memo } from 'react';
import { Link } from 'wouter';
import { formatDateTime } from '../../time/formatters';

interface PropsT {
  retroSlug: string;
  archiveId: string;
  created: number;
}

export default memo(({ retroSlug, archiveId, created }: PropsT) => (
  <Link
    className="archive-link"
    to={`/retros/${retroSlug}/archives/${archiveId}`}
  >
    {formatDateTime(created)}
  </Link>
));
