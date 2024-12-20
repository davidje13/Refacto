import { memo } from 'react';
import { Link } from 'wouter';
import { type RetroArchiveSummary } from '../../shared/api-entities';
import { formatDateTime } from '../../time/formatters';

interface PropsT {
  slug: string;
  archives: RetroArchiveSummary[];
}

export const ArchiveList = memo(({ slug, archives }: PropsT) => {
  if (!archives.length) {
    return <p>This retro has no archives.</p>;
  }

  return (
    <ul className="archives">
      {sortArchives(archives).map(({ id, created }) => (
        <li key={id}>
          <Link
            className="archive-link"
            to={`/retros/${encodeURIComponent(slug)}/archives/${encodeURIComponent(id)}`}
          >
            {formatDateTime(created)}
          </Link>
        </li>
      ))}
    </ul>
  );
});

function sortArchives(archives: RetroArchiveSummary[]): RetroArchiveSummary[] {
  const sorted = archives.slice();
  sorted.sort(archiveCreatedComparator);
  return sorted;
}

function archiveCreatedComparator(
  a: RetroArchiveSummary,
  b: RetroArchiveSummary,
): number {
  // sort newer-to-older
  return b.created - a.created;
}
