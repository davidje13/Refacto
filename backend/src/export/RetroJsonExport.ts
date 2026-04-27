import { randomUUID } from 'node:crypto';
import type {
  Retro,
  RetroData,
  RetroItem,
  RetroItemAttachment,
  RetroArchive,
  RetroHistoryItem,
  Curve,
  CurveMove,
  CurveCubicBezier,
  Colour,
} from '@refacto/shared/api-entities';
import { getQuestionID, makeUserAnswerID } from '@refacto/shared/health';

type MaybeAsyncIterable<T> = Iterable<T> | AsyncIterable<T>;

export interface RetroItemGiphyAttachmentJsonExport {
  type: 'giphy';
  url: string;
  alt?: string | undefined;
}

export interface RetroItemSketchAttachmentJsonExport {
  type: 'sketch';
  curve: string;
  colour: Colour;
}

export type RetroItemAttachmentJsonExport =
  | RetroItemGiphyAttachmentJsonExport
  | RetroItemSketchAttachmentJsonExport;

export interface RetroItemJsonExport {
  created: string;
  category: string;
  group?: string | undefined;
  for?: string | undefined;
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

function exportCurve(curve: Curve): string {
  return curve.map((p) => (p.length === 2 ? 'M' : 'C') + p.join(' ')).join('');
}

function importCurve(curve: string): Curve {
  const r: Curve = [];
  let current: number[] = [];
  let mode = '';
  function add() {
    switch (mode) {
      case 'M':
        if (current.length === 2) {
          r.push(current as CurveMove);
        }
        break;
      case 'C':
        for (let i = 0; i + 6 <= current.length; i += 6) {
          r.push(current.slice(i, 6) as CurveCubicBezier);
        }
        break;
    }
  }
  for (const part of curve.matchAll(
    /\s*([a-z])|\s*([+\-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+\-]?\d+)?)/giy,
  )) {
    if (part[1]) {
      add();
      mode = part[1];
      current = [];
    } else {
      current.push(Number.parseFloat(part[2]!));
    }
  }
  add();
  return r;
}

function exportRetroItemAttachment(
  attachment: RetroItemAttachment,
): RetroItemAttachmentJsonExport {
  switch (attachment.type) {
    case 'giphy':
      return { type: 'giphy', url: attachment.url, alt: attachment.alt };
    case 'sketch':
      return {
        type: 'sketch',
        curve: exportCurve(attachment.curve),
        colour: attachment.colour,
      };
  }
}

function importRetroItemAttachment(
  attachment: RetroItemAttachmentJsonExport,
): RetroItemAttachment {
  switch (attachment.type) {
    case 'giphy':
      return { type: 'giphy', url: attachment.url, alt: attachment.alt };
    case 'sketch':
      return {
        type: 'sketch',
        curve: importCurve(attachment.curve),
        colour: attachment.colour,
      };
  }
}

function exportRetroItem(item: RetroItem, format: string): RetroItemJsonExport {
  const result: RetroItemJsonExport = {
    created: exportTimestamp(item.created),
    category: item.category,
    group: item.group,
    message: item.message,
    votes: item.votes,
  };
  if (format === 'health') {
    result.for = getQuestionID(item);
  }
  if (item.doneTime > 0) {
    result.completed = exportTimestamp(item.doneTime);
  }
  if (item.attachment) {
    result.attachment = exportRetroItemAttachment(item.attachment);
  }
  return result;
}

function importRetroItem(item: RetroItemJsonExport, format: string): RetroItem {
  return {
    id:
      format === 'health' && item.for
        ? makeUserAnswerID(item.for, randomUUID())
        : randomUUID(),
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

function exportRetroData(retro: RetroData): RetroDataJsonExport {
  return {
    format: retro.format,
    options: retro.options,
    items: retro.items.map((item) => exportRetroItem(item, retro.format)),
    history: retro.history.map(exportRetroHistoryItem),
  };
}

export function importRetroDataJson(retro: RetroDataJsonExport): RetroData {
  return {
    format: retro.format,
    options: retro.options,
    items: retro.items.map((item) => importRetroItem(item, retro.format)),
    history: retro.history?.map(importRetroHistoryItem) ?? [],
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
