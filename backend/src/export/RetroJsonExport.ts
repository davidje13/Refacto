import {
  Retro,
  RetroData,
  RetroItem,
  RetroItemAttachment,
  RetroArchive,
} from 'refacto-entities';

interface RetroItemAttachmentJsonExport {
  type: string;
  url: string;
}

interface RetroItemJsonExport {
  created: string;
  category: string;
  message: string;
  votes: number;
  completed?: string;
  attachment?: RetroItemAttachmentJsonExport;
}

interface RetroDataJsonExport {
  format: string;
  options: Record<string, unknown>;
  items: RetroItemJsonExport[];
}

interface RetroArchiveJsonExport {
  created: string;
  snapshot: RetroDataJsonExport;
}

interface RetroJsonExport {
  url: string;
  name: string;
  current: RetroDataJsonExport;
  archives?: RetroArchiveJsonExport[];
}

export function timestampToJson(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString();
}

export function exportRetroItemAttachment(
  attachment: RetroItemAttachment,
): RetroItemAttachmentJsonExport {
  return {
    type: attachment.type,
    url: attachment.url,
  };
}

export function exportRetroItem(
  item: RetroItem,
): RetroItemJsonExport {
  const result: RetroItemJsonExport = {
    created: timestampToJson(item.created),
    category: item.category,
    message: item.message,
    votes: item.votes,
  };
  if (item.doneTime > 0) {
    result.completed = timestampToJson(item.doneTime);
  }
  if (item.attachment) {
    result.attachment = exportRetroItemAttachment(item.attachment);
  }
  return result;
}

export function exportRetroData(
  archive: RetroData,
): RetroDataJsonExport {
  return {
    format: archive.format,
    options: archive.options,
    items: archive.items.map(exportRetroItem),
  };
}
export function exportRetroArchive(
  archive: RetroArchive,
): RetroArchiveJsonExport {
  return {
    created: timestampToJson(archive.created),
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
