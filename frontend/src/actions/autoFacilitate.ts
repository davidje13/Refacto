import { type RetroItem } from '../shared/api-entities';

interface CategoryStats {
  total: number;
  remaining: number;
}

function getCategories(
  items: RetroItem[],
  isRemaining: (i: RetroItem) => boolean,
) {
  const categories = new Set(items.map((item) => item.category));

  const result = new Map<string, CategoryStats>();
  for (const category of categories) {
    const all = items.filter((item) => item.category === category);

    result.set(category, {
      total: all.length,
      remaining: all.filter(isRemaining).length,
    });
  }

  return result;
}

function seq<T>(list: T[], item: T): number {
  const p = list.indexOf(item);
  return p === -1 ? list.length : p;
}

function itemPriority(a: RetroItem, b: RetroItem): number {
  const voteDiff = b.votes - a.votes;
  if (voteDiff !== 0) {
    return voteDiff;
  }
  // introduce deterministic randomness by sorting by
  // milliseconds of creation time
  return (b.created % 1000) - (a.created % 1000);
}

export function autoFacilitate(
  items: RetroItem[],
  categoryPreferences: string[],
  currentItemID: string | null,
): RetroItem | undefined {
  const isRemaining = (item: RetroItem) =>
    item.doneTime === 0 && item.id !== currentItemID;

  const remainingItems = items.filter(isRemaining);

  if (remainingItems.length === 0) {
    return undefined;
  }

  const categories = getCategories(items, isRemaining);

  if (remainingItems.length > 1) {
    // reserve a preferred item for last
    for (const categoryPreference of categoryPreferences) {
      const cat = categories.get(categoryPreference);
      if (cat && cat.remaining > 0) {
        cat.total -= 1;
        cat.remaining -= 1;
        break;
      }
    }
  }

  // pick the column which has the highest remaining/total ratio
  let chosenCat = '';
  let chosenRatio = 0;
  categories.forEach((details, cat) => {
    if (details.remaining === 0) {
      return;
    }
    const ratio = details.remaining / details.total;
    if (ratio < chosenRatio) {
      return;
    }
    if (
      ratio === chosenRatio &&
      seq(categoryPreferences, cat) >= seq(categoryPreferences, chosenCat)
    ) {
      return;
    }
    chosenCat = cat;
    chosenRatio = ratio;
  });

  return remainingItems
    .filter((item) => item.category === chosenCat)
    .sort(itemPriority)[0];
}
