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
  <Link className="archive-link" to={`/retros/${retroSlug}/archives/${archiveId}`}>
    { formatDateTime(created) }
  </Link>
);

export default React.memo(ArchiveLink);
