import type {
  RetroItemJsonExport,
  RetroJsonExport,
  RetroDataJsonExport,
  RetroItemAttachmentJsonExport,
  RetroArchiveJsonExport,
  RetroHistoryItemJsonExport,
} from '../export/RetroJsonExport';
import { json, ValidationError } from './json';

const jsonIsoDate = (source: unknown, path = ''): string => {
  if (typeof source !== 'string') {
    throw new ValidationError('Expected ISO date', path);
  }
  const timestamp = Date.parse(source);
  if (Number.isNaN(timestamp)) {
    throw new ValidationError('Expected ISO date', path);
  }
  return source;
};

export const extractExportedRetroItem = json.object<RetroItemJsonExport>({
  created: jsonIsoDate,
  category: json.string,
  message: json.string,
  votes: json.number,
  completed: json.optional(jsonIsoDate),
  attachment: json.optional(
    json.object<RetroItemAttachmentJsonExport>({
      type: json.string,
      url: json.string,
      alt: json.optional(json.string),
    }),
  ),
});

export const extractExportedRetroHistoryItem =
  json.exactObject<RetroHistoryItemJsonExport>({
    time: json.string,
    format: json.string,
    data: json.record(json.any),
  });

export const extractExportedRetroData = json.object<Sync<RetroDataJsonExport>>({
  format: json.string,
  options: json.record(json.any),
  items: json.array(extractExportedRetroItem),
  history: json.optional(json.array(extractExportedRetroHistoryItem)),
});

type Sync<T> = {
  [k in keyof T]: T[k] extends string | undefined
    ? T[k]
    : T[k] extends AsyncIterable<infer V>
      ? Sync<V>[]
      : T[k] extends Iterable<infer V>
        ? Sync<V>[]
        : T[k] extends AsyncIterable<infer V> | undefined
          ? Sync<V>[] | undefined
          : T[k] extends Iterable<infer V> | undefined
            ? Sync<V>[] | undefined
            : T[k] extends object
              ? Sync<T[k]>
              : T[k];
};

export const extractExportedRetro = json.object<Sync<RetroJsonExport>>({
  url: json.string,
  name: json.string,
  current: extractExportedRetroData,
  archives: json.optional(
    json.array(
      json.object<Sync<RetroArchiveJsonExport>>({
        created: jsonIsoDate,
        snapshot: extractExportedRetroData,
      }),
    ),
  ),
});
