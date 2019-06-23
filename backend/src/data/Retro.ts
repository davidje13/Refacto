import RetroItem from './RetroItem';

export default interface Retro {
  id: string;
  ownerId: string;
  slug: string;
  retro: {
    name: string;
    state: object;
    data: {
      format: string;
      items: RetroItem[];
    };
  };
}
