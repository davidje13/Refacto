import type {
  RetroItem,
  RetroItemAttachment,
  RetroData,
  Retro,
  RetroHistoryItem,
} from '../shared/api-entities';
import { json } from './json';

export const extractRetroItem = json.exactObject<RetroItem>({
  id: json.string,
  category: json.string,
  created: json.number,
  message: json.string,
  attachment: json.nullable(
    json.exactObject<RetroItemAttachment>({
      type: json.string,
      url: json.string,
      alt: json.optional(json.string),
    }),
  ),
  votes: json.number,
  doneTime: json.number,
  group: json.optional(json.string),
});

export const extractRetroHistoryItem = json.exactObject<RetroHistoryItem>({
  time: json.number,
  format: json.string,
  data: json.record(json.any),
});

export const extractRetroData = json.exactObject<RetroData>({
  format: json.string,
  options: json.record(json.any),
  items: json.array(extractRetroItem),
  history: json.fallback(json.array(extractRetroHistoryItem), []), // temporarily allowed to be omitted for compatibility with old frontend
});

export const extractRetro = json.exactObject<Retro>({
  id: json.string,
  slug: json.string,
  name: json.string,
  ownerId: json.string,
  state: json.record(json.any),
  groupStates: json.record(json.record(json.any)),
  format: json.string,
  options: json.record(json.any),
  items: json.array(extractRetroItem),
  history: json.array(extractRetroHistoryItem),
  scheduledDelete: json.number,
});
