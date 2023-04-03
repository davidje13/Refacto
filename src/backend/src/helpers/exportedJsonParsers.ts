import type {
  RetroItemJsonExport,
  RetroJsonExport,
  RetroDataJsonExport,
  RetroItemAttachmentJsonExport,
  RetroArchiveJsonExport,
} from '../export/RetroJsonExport';
import json from './json';

const jsonIsoDate = (source: unknown): string => {
  if (typeof source !== 'string') {
    throw new Error('Expected ISO date');
  }
  const timestamp = Date.parse(source);
  if (Number.isNaN(timestamp)) {
    throw new Error('Expected ISO date');
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
    }),
  ),
});

export const extractExportedRetroData = json.object<RetroDataJsonExport>({
  format: json.string,
  options: json.record(json.any),
  items: json.array(extractExportedRetroItem),
});

export const extractExportedRetro = json.object<RetroJsonExport>({
  url: json.string,
  name: json.string,
  current: extractExportedRetroData,
  archives: json.optional(
    json.array(
      json.object<RetroArchiveJsonExport>({
        created: jsonIsoDate,
        snapshot: extractExportedRetroData,
      }),
    ),
  ),
});
