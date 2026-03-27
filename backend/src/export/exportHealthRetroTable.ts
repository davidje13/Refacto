import type { Retro } from '../shared/api-entities';
import { summariseHealthVotes, type HealthSummary } from '../shared/health';
import { isoDate } from '../helpers/formatters';

function exportHealthItems(summary: HealthSummary): string[][] {
  const date = isoDate(summary.time);
  const items = [...summary.data.questions].sort((a, b) =>
    a.id > b.id ? 1 : -1,
  );
  return items.map((item) => [
    date,
    item.id,
    String(item.counts.good),
    String(item.counts.mid),
    String(item.counts.bad),
    String(item.counts.skip),
  ]);
}

export async function* exportHealthRetroTable(
  retro: Retro,
): AsyncGenerator<string[], void, undefined> {
  yield ['Date', 'Question', 'Good', 'Mid', 'Bad', 'Skip'];
  const historic = retro.history.filter(
    (item) => item.format === 'health',
  ) as HealthSummary[];
  for (const item of historic.sort((a, b) => a.time - b.time)) {
    yield* exportHealthItems(item);
  }
  if (retro.format === 'health') {
    const summary = summariseHealthVotes(retro.items);
    if (summary) {
      yield* exportHealthItems(summary);
    }
  }
}
