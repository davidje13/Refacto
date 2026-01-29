import type { Logger } from '../services/LogService';
import type { RetroDeletionService } from '../services/RetroDeletionService';

export class ScheduledRetroDeletionTask {
  declare private _next: NodeJS.Timeout;
  declare private _running: Promise<void> | undefined;
  private _closed = false;

  constructor(
    retroDeletionService: RetroDeletionService,
    logger: Logger,
    deleteRetroDelay: number,
  ) {
    const runner = () => {
      this._running = (async () => {
        const next = { value: 60 * 60 * 1000 };
        try {
          for await (const retroId of retroDeletionService.getRetroIdsForDeletion(
            next,
          )) {
            await retroDeletionService.deleteNow(retroId);
            logger.log({
              event: 'delete retro on schedule',
              metadata: { retroId },
            });
            if (this._closed) {
              break;
            }
          }
        } catch (error) {
          logger.error(error, { context: 'retro deletion service' });
        } finally {
          if (this._closed) {
            return;
          }
          // schedule next check for the time when the next known item expires
          let nextCheck = next.value - Date.now();
          if (deleteRetroDelay > 0) {
            // catch new deletions within the deletion window
            nextCheck = Math.min(nextCheck, deleteRetroDelay);
          } else if (!Number.isFinite(nextCheck)) {
            return; // no remaining items and not possible to schedule new ones: stop
          }

          // limit to 7 days to avoid overflowing 32-bit signed integer (setTimeout limitation)
          nextCheck = Math.min(nextCheck, 7 * 24 * 60 * 60 * 1000);

          // schedule with a small variation so that load balanced
          // instances do not all fire at once
          nextCheck += Math.random() * 60 * 1000;

          this._next = setTimeout(runner, nextCheck);
        }
      })();
    };
    this._next = setTimeout(runner, 0);
  }

  async close() {
    this._closed = true;
    clearTimeout(this._next);
    await this._running;
  }
}
