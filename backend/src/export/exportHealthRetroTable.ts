import type { Retro } from '../shared/api-entities';
import { summariseHealthVotes, type HealthSummary } from '../shared/health';
import { isoDate } from '../helpers/formatters';

function exportHealthItems(
  summary: HealthSummary,
  names: Map<string, string>,
): string[][] {
  const date = isoDate(summary.time);
  const items = [...summary.data.questions].sort((a, b) =>
    a.id > b.id ? 1 : -1,
  );
  return items.map((item) => [
    date,
    names.get(item.id) || item.id,
    String(item.counts.good),
    String(item.counts.mid),
    String(item.counts.bad),
    String(item.counts.skip),
  ]);
}

export async function* exportHealthRetroTable(
  retro: Retro,
): AsyncGenerator<string[], void, undefined> {
  const names = getHealthQuestionNames(retro);
  yield ['Date', 'Question', 'Good', 'Mid', 'Bad', 'Skip'];
  const historic = retro.history.filter(
    (item) => item.format === 'health',
  ) as HealthSummary[];
  for (const item of historic.sort((a, b) => a.time - b.time)) {
    yield* exportHealthItems(item, names);
  }
  if (retro.format === 'health') {
    const summary = summariseHealthVotes(retro.items);
    if (summary) {
      yield* exportHealthItems(summary, names);
    }
  }
}

function getHealthQuestionNames(retro: Retro) {
  const questions = retro.options['health-questions'];
  const validatedQuestions = Array.isArray(questions)
    ? questions
    : DEFAULT_QUESTION_NAMES;
  return new Map<string, string>(
    validatedQuestions.map((q) => [q.id, q.title]),
  );
}

// note: this is a subset of the frontend's DEFAULT_QUESTIONS
// maybe it should be made into an API to avoid duplication of data?
const DEFAULT_QUESTION_NAMES = [
  { id: 'process', title: 'Suitable process' },
  { id: 'quality', title: 'High quality work' },
  { id: 'value', title: 'Useful output' },
  { id: 'release', title: 'Easy to release' },
  { id: 'speed', title: 'Quick turnaround' },
  { id: 'support', title: 'Help & support' },
  { id: 'fun', title: 'Having fun' },
  { id: 'learning', title: 'Learning' },
  { id: 'mission', title: 'Worthwhile mission' },
  { id: 'autonomy', title: 'Autonomy' },
];
