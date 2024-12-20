import { randomUUID } from 'node:crypto';
import {
  type Retro,
  type RetroData,
  type RetroItem,
  type RetroItemAttachment,
  type RetroArchive,
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
  completed?: string;
  attachment?: RetroItemAttachmentJsonExport;
}

export interface RetroDataJsonExport {
  format: string;
  options: Record<string, unknown>;
  items: RetroItemJsonExport[];
}

export interface RetroArchiveJsonExport {
  created: string;
  snapshot: RetroDataJsonExport;
}

export interface RetroJsonExport {
  url: string;
  name: string;
  current: RetroDataJsonExport;
  archives?: AsyncIterable<RetroArchiveJsonExport>;
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

function exportRetroData(archive: RetroData): RetroDataJsonExport {
  return {
    format: archive.format,
    options: archive.options,
    items: archive.items.map(exportRetroItem),
  };
}

export function importRetroDataJson(archive: RetroDataJsonExport): RetroData {
  return {
    format: archive.format,
    options: archive.options,
    items: archive.items.map(importRetroItem),
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
  archives?: MaybeAsyncIterable<RetroArchive>,
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
): AsyncGenerator<O> {
  for await (const item of input) {
    yield fn(item);
  }
}
