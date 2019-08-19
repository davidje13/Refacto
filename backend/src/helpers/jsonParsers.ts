import { RetroItem, RetroData, Retro } from 'refacto-entities';
import json from './json';

export const extractRetroItem = json.object<RetroItem>({
  id: json.string,
  category: json.string,
  created: json.number,
  message: json.string,
  votes: json.number,
  done: json.boolean,
});

export const extractRetroData = json.object<RetroData>({
  format: json.string,
  options: json.record,
  items: json.array(extractRetroItem),
});

export const extractRetro = json.object<Retro>({
  id: json.string,
  slug: json.string,
  name: json.string,
  ownerId: json.string,
  state: json.record,
  format: json.string,
  options: json.record,
  items: json.array(extractRetroItem),
});
