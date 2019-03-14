import Router from '../websocket-express/Router';

export default class WebSocketRouter extends Router {
  constructor(retroService) {
    super();

    this.ws('/retros/:retroid', async (req, ws) => {
      const { retroid } = req.params;

      const retro = await retroService.getRetro(retroid);
      if (!retro) {
        ws.close();
        return;
      }

      ws.send('hi');
    });
  }
}
