import { v4 as uuidv4 } from 'uuid';
import {
  type Retro,
  type RetroData,
  type RetroItem,
  type RetroItemAttachment,
  type RetroArchive,
} from '../shared/api-entities';

export interface RetroItemAttachmentJsonExport {
  type: string;
  url: string;
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
  archives?: RetroArchiveJsonExport[];
}

export function exportTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString();
}

export function importTimestamp(isoDate: string): number {
  return Date.parse(isoDate);
}

export function exportRetroItemAttachment(
  attachment: RetroItemAttachment,
): RetroItemAttachmentJsonExport {
  return {
    type: attachment.type,
    url: attachment.url,
  };
}

export function importRetroItemAttachment(
  attachment: RetroItemAttachmentJsonExport,
): RetroItemAttachment {
  return {
    type: attachment.type,
    url: attachment.url,
  };
}

export function exportRetroItem(item: RetroItem): RetroItemJsonExport {
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

export function importRetroItem(item: RetroItemJsonExport): RetroItem {
  return {
    id: uuidv4(),
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

export function exportRetroData(archive: RetroData): RetroDataJsonExport {
  return {
    format: archive.format,
    options: archive.options,
    items: archive.items.map(exportRetroItem),
  };
}

export function importRetroData(archive: RetroDataJsonExport): RetroData {
  return {
    format: archive.format,
    options: archive.options,
    items: archive.items.map(importRetroItem),
  };
}

export function exportRetroArchive(
  archive: RetroArchive,
): RetroArchiveJsonExport {
  return {
    created: exportTimestamp(archive.created),
    snapshot: exportRetroData(archive),
  };
}

export function exportRetro(
  retro: Retro,
  archives?: Readonly<RetroArchive[]>,
): RetroJsonExport {
  const result: RetroJsonExport = {
    url: retro.slug,
    name: retro.name,
    current: exportRetroData(retro),
  };
  if (archives && archives.length > 0) {
    result.archives = archives.map(exportRetroArchive);
  }
  return result;
}
