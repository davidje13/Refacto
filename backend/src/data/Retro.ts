import RetroData from './RetroData';

export default interface Retro {
  id: string;
  ownerId: string;
  slug: string;
  retro: {
    name: string;
    state: object;
    data: RetroData;
  };
}
