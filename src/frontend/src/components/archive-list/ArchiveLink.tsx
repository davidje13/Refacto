import React from 'react';
import { Link } from 'wouter';
import { formatDateTime } from '../../time/formatters';

interface PropsT {
  retroSlug: string;
  archiveId: string;
  created: number;
}

const ArchiveLink = ({
  retroSlug,
  archiveId,
  created,
}: PropsT): React.ReactElement => (
  <Link to={`/retros/${retroSlug}/archives/${archiveId}`}>
    <div className="archive-link">{ formatDateTime(created) }</div>
  </Link>
);

export default React.memo(ArchiveLink);
