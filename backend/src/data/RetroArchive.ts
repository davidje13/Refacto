import RetroItem from './RetroItem';

export default interface RetroArchive {
  id: string;
  retroId: string;
  created: number;
  data: {
    format: string;
    items: RetroItem[];
  };
}
