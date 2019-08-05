import { RetroItem, RetroData } from 'refacto-entities';
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
  items: json.array(extractRetroItem),
});
