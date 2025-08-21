import type { Retro, RetroArchive, RetroItem } from '../shared/api-entities';

type MaybeAsyncIterable<T> = Iterable<T> | AsyncIterable<T>;

function exportItems(
  items: RetroItem[],
  archive: RetroArchive | null,
  index: number,
): string[][] {
  let archiveID = 'current';
  if (archive) {
    archiveID = `#${index + 1} (${dateString(new Date(archive.created))})`;
  }
  return [...items]
    .sort(RETRO_ITEM_ORDER)
    .map((item) => [
      archiveID,
      CATEGORIES.get(item.category)?.label ?? item.category,
      item.message,
      String(item.votes),
      item.category === 'action'
        ? item.doneTime > 0
          ? 'Complete'
          : ''
        : item.doneTime > 0
          ? 'Discussed'
          : '',
    ]);
}

function dateString(date: Date) {
  return date.toISOString().split('T')[0];
}

export async function* exportRetroTable(
  retro: Retro,
  archives?: MaybeAsyncIterable<RetroArchive>,
): AsyncGenerator<string[]> {
  yield ['Archive', 'Category', 'Message', 'Votes', 'State'];
  yield* exportItems(retro.items, null, 0);
  if (archives) {
    let i = 0;
    for await (const archive of archives) {
      yield* exportItems(archive.items, archive, i);
      ++i;
    }
  }
}

const CATEGORIES = new Map([
  ['happy', { label: 'Happy' }],
  ['meh', { label: 'Question' }],
  ['sad', { label: 'Sad' }],
  ['action', { label: 'Action' }],
]);

const CATEGORY_ORDER = [...CATEGORIES.keys()];

const RETRO_ITEM_ORDER = (a: RetroItem, b: RetroItem) =>
  CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
  a.doneTime - b.doneTime ||
  a.votes - b.votes ||
  a.created - b.created;
