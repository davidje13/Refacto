import RetroData from './RetroData';

export default interface RetroArchive {
  id: string;
  retroId: string;
  created: number;
  data: RetroData;
}
