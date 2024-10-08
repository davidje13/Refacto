import type { DispatchSpec } from 'shared-reducer/frontend';
import { of as rxjsOf, throwError, Observable } from 'rxjs';
import {
  type Retro,
  type RetroArchive,
  type RetroSummary,
  type ClientConfig,
} from '../../shared/api-entities';
import { type RetroSubscription } from '../RetroTracker';
import { type Spec } from '../reducer';
import { ObservableTracker } from '../../rxjs/ObservableTracker';
import { SingleObservableTracker } from '../../rxjs/SingleObservableTracker';

class FakeRetroTracker {
  public subscribed = 0;

  private data = new Map<string, Retro>();

  private expectedRetroToken: string | null = null;

  public dispatch = (_: DispatchSpec<Retro, Spec<Retro>>) => undefined;

  public setExpectedToken(retroToken: string) {
    this.expectedRetroToken = retroToken;
  }

  public setServerData(retroId: string, serverData: Retro) {
    this.data.set(retroId, serverData);
  }

  public subscribe(
    retroId: string,
    retroToken: string,
    retroStateCallback: (state: Retro) => void,
  ): RetroSubscription {
    if (this.expectedRetroToken && this.expectedRetroToken !== retroToken) {
      throw new Error(`Incorrect retro token: ${retroToken}`);
    }

    this.subscribed += 1;

    const serverData = this.data.get(retroId);
    if (!serverData) {
      throw new Error('not found');
    }

    retroStateCallback({ ...serverData });

    return {
      dispatch: Object.assign(this.dispatch, {
        sync: (specs: DispatchSpec<Retro, Spec<Retro>>) => {
          this.dispatch(specs);
          return Promise.resolve(this.data.get(retroId)!);
        },
      }),
      unsubscribe: () => {
        this.subscribed -= 1;
      },
    };
  }
}

class FakeArchiveTracker {
  private data = new Map<string, Map<string, RetroArchive>>();

  private expectedRetroToken: string | null = null;

  public setExpectedToken(retroToken: string) {
    this.expectedRetroToken = retroToken;
  }

  public setServerData(
    retroId: string,
    archiveId: string,
    archive: RetroArchive,
  ) {
    if (!this.data.has(retroId)) {
      this.data.set(retroId, new Map());
    }
    this.data.get(retroId)?.set(archiveId, archive);
  }

  public get(
    retroId: string,
    archiveId: string,
    retroToken: string,
  ): Observable<RetroArchive> {
    if (this.expectedRetroToken && this.expectedRetroToken !== retroToken) {
      return throwError(`Incorrect retro token: ${retroToken}`);
    }

    const serverData = this.data.get(retroId);
    if (!serverData) {
      return throwError('not found');
    }
    const archive = serverData.get(archiveId);
    if (!archive) {
      return throwError('not found');
    }
    return rxjsOf(archive);
  }

  public getList(
    retroId: string,
    retroToken: string,
  ): Observable<{ archives: RetroArchive[] }> {
    if (this.expectedRetroToken && this.expectedRetroToken !== retroToken) {
      return throwError(`Incorrect retro token: ${retroToken}`);
    }

    const archives: RetroArchive[] = [];
    const serverData = this.data.get(retroId);
    if (serverData) {
      serverData.forEach((archive: RetroArchive, archiveId: string) => {
        archives.push({
          ...archive,
          id: archiveId,
        });
      });
    }
    return rxjsOf({ archives });
  }
}

class FakeUserTokenService {
  public capturedService: string | null = null;

  public capturedExternalToken: string | null = null;

  private userToken: string | null = null;

  public setServerData(userToken: string) {
    this.userToken = userToken;
  }

  public async login(service: string, externalToken: string): Promise<string> {
    this.capturedService = service;
    this.capturedExternalToken = externalToken;

    if (!this.userToken) {
      throw new Error('some error');
    }
    return this.userToken;
  }
}

class FakeRetroTokenService {
  public capturedPassword: string | null = null;

  public capturedUserToken: string | null = null;

  private data = new Map<string, string>();

  public setServerData(retroId: string, retroToken: string) {
    this.data.set(retroId, retroToken);
  }

  public async getRetroTokenForPassword(
    retroId: string,
    password: string,
  ): Promise<string> {
    this.capturedPassword = password;
    const retroToken = this.data.get(retroId);
    if (!retroToken) {
      throw new Error('some error');
    }
    return retroToken;
  }

  public async getRetroTokenForUser(
    _retroId: string,
    userToken: string,
  ): Promise<string | null> {
    this.capturedUserToken = userToken;
    throw new Error('not owner');
  }
}

interface RetroOptions {
  name: string;
  slug: string;
  password: string;
  userToken: string;
}

class FakeRetroService {
  public capturedName: string | null = null;

  public capturedSlug: string | null = null;

  public capturedPassword: string | null = null;

  public capturedUserToken: string | null = null;

  private id: string | null = null;

  public setServerData(retroId: string) {
    this.id = retroId;
  }

  public async create({
    name,
    slug,
    password,
    userToken,
  }: RetroOptions): Promise<string> {
    this.capturedName = name;
    this.capturedSlug = slug;
    this.capturedPassword = password;
    this.capturedUserToken = userToken;
    return this.id!;
  }
}

interface RetroList {
  retros: RetroSummary[];
}

export const configService = new SingleObservableTracker<ClientConfig>();
export const retroListTracker = new ObservableTracker<string, RetroList>();
export const slugTracker = new ObservableTracker<string, string>();
export const retroTracker = new FakeRetroTracker();
export const archiveTracker = new FakeArchiveTracker();
export const retroTokenService = new FakeRetroTokenService();
export const retroService = new FakeRetroService();
export const userTokenService = new FakeUserTokenService();

export const retroTokenTracker = new ObservableTracker<string, string>();
export const userTokenTracker = new SingleObservableTracker<string | null>();
