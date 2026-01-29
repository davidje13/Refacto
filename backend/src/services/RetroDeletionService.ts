import type { Collection, DB } from 'collection-storage';
import type { RetroArchiveService } from './RetroArchiveService';
import type { RetroAuthService } from './RetroAuthService';
import type { RetroService } from './RetroService';

export class RetroDeletionService {
  declare private readonly scheduleCollection: Collection<RetroSchedule>;

  constructor(
    db: DB,
    private readonly retroAuthService: RetroAuthService,
    private readonly retroService: RetroService,
    private readonly retroArchiveService: RetroArchiveService,
  ) {
    this.scheduleCollection = db.getCollection('retro_delete_schedule');
  }

  async scheduleDeletion(retroId: string, time: number) {
    const now = Date.now();
    await this.retroService.retroBroadcaster.update(retroId, {
      scheduledDelete: ['=', Math.max(time, now)],
    });
    if (time > now) {
      await this.scheduleCollection
        .where('id', retroId)
        .update({ time }, { upsert: true });
    } else {
      await this.deleteNow(retroId);
    }
  }

  async cancelDeletion(retroId: string) {
    const removed = await this.scheduleCollection.where('id', retroId).remove();
    if (removed) {
      await this.retroService.retroBroadcaster.update(retroId, {
        scheduledDelete: ['=', 0],
      });
    }
  }

  async *getRetroIdsForDeletion(nextOut?: {
    value: number;
  }): AsyncGenerator<string, void, undefined> {
    // we assume a fairly low volume of retros pending deletion, so we can just
    // iterate through all of them each interval to see which are now up for
    // deletion. With increased volumes, we'd need to use a real queue here.
    const now = Date.now();
    let next = Number.POSITIVE_INFINITY;
    for await (const item of this.scheduleCollection.all().values()) {
      if (now >= item.time) {
        yield item.id;
      } else if (item.time < next) {
        next = item.time;
      }
    }
    if (nextOut) {
      nextOut.value = next;
    }
  }

  async deleteNow(retroId: string) {
    await this.retroAuthService.deleteRetro(retroId);
    await this.retroArchiveService.deleteRetro(retroId);
    await this.retroService.deleteRetro(retroId);
    await this.scheduleCollection.where('id', retroId).remove();
  }
}

interface RetroSchedule {
  id: string;
  time: number;
}
