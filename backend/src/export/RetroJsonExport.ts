import { randomUUID } from 'node:crypto';
import type {
  Retro,
  RetroData,
  RetroItem,
  RetroItemAttachment,
  RetroArchive,
  RetroHistoryItem,
} from '../shared/api-entities';

type MaybeAsyncIterable<T> = Iterable<T> | AsyncIterable<T>;

export interface RetroItemAttachmentJsonExport {
  type: string;
  url: string;
  alt?: string | undefined;
}

export interface RetroItemJsonExport {
  created: string;
  category: string;
  group?: string | undefined;
  message: string;
  votes: number;
  completed?: string | undefined;
  attachment?: RetroItemAttachmentJsonExport | undefined;
}

export interface RetroHistoryItemJsonExport {
  time: string;
  format: string;
  data: Record<string, unknown>;
}

export interface RetroDataJsonExport {
  format: string;
  options: Record<string, unknown>;
  items: RetroItemJsonExport[];
  history?: RetroHistoryItemJsonExport[] | undefined;
}

export interface RetroArchiveJsonExport {
  created: string;
  snapshot: RetroDataJsonExport;
}

export interface RetroJsonExport {
  url: string;
  name: string;
  current: RetroDataJsonExport;
  archives?: AsyncIterable<RetroArchiveJsonExport> | undefined;
}

function exportTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString();
}

export function importTimestamp(isoDate: string): number {
  return Date.parse(isoDate);
}

function exportRetroItemAttachment(
  attachment: RetroItemAttachment,
): RetroItemAttachmentJsonExport {
  return {
    type: attachment.type,
    url: attachment.url,
    alt: attachment.alt,
  };
}

function importRetroItemAttachment(
  attachment: RetroItemAttachmentJsonExport,
): RetroItemAttachment {
  return {
    type: attachment.type,
    url: attachment.url,
    alt: attachment.alt,
  };
}

function exportRetroItem(item: RetroItem): RetroItemJsonExport {
  const result: RetroItemJsonExport = {
    created: exportTimestamp(item.created),
    category: item.category,
    group: item.group,
    message: item.message,
    votes: item.votes,
  };
  if (item.doneTime > 0) {
    result.completed = exportTimestamp(item.doneTime);
  }
  if (item.attachment) {
    result.attachment = exportRetroItemAttachment(item.attachment);
  }
  return result;
}

function importRetroItem(item: RetroItemJsonExport): RetroItem {
  return {
    id: randomUUID(),
    created: importTimestamp(item.created),
    category: item.category,
    group: item.group,
    message: item.message,
    votes: item.votes,
    doneTime: item.completed ? importTimestamp(item.completed) : 0,
    attachment: item.attachment
      ? importRetroItemAttachment(item.attachment)
      : null,
  };
}

function exportRetroHistoryItem(
  item: RetroHistoryItem,
): RetroHistoryItemJsonExport {
  return {
    time: exportTimestamp(item.time),
    format: item.format,
    data: item.data,
  };
}

function importRetroHistoryItem(
  item: RetroHistoryItemJsonExport,
): RetroHistoryItem {
  return {
    time: importTimestamp(item.time),
    format: item.format,
    data: item.data,
  };
}

function exportRetroData(archive: RetroData): RetroDataJsonExport {
  return {
    format: archive.format,
    options: archive.options,
    items: archive.items.map(exportRetroItem),
    history: archive.history.map(exportRetroHistoryItem),
  };
}

export function importRetroDataJson(archive: RetroDataJsonExport): RetroData {
  return {
    format: archive.format,
    options: archive.options,
    items: archive.items.map(importRetroItem),
    history: archive.history?.map(importRetroHistoryItem) ?? [],
  };
}

function exportRetroArchive(archive: RetroArchive): RetroArchiveJsonExport {
  return {
    created: exportTimestamp(archive.created),
    snapshot: exportRetroData(archive),
  };
}

export function exportRetroJson(
  retro: Retro,
  archives?: MaybeAsyncIterable<RetroArchive> | undefined,
): RetroJsonExport {
  const result: RetroJsonExport = {
    url: retro.slug,
    name: retro.name,
    current: exportRetroData(retro),
  };
  if (archives) {
    result.archives = map(archives, exportRetroArchive);
  }
  return result;
}

async function* map<I, O>(
  input: MaybeAsyncIterable<I>,
  fn: (i: I) => O,
): AsyncGenerator<O, void, undefined> {
  for await (const item of input) {
    yield fn(item);
  }
}
