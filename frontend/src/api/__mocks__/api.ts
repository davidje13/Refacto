import { of as rxjsOf, throwError, Observable } from 'rxjs';
import ObservableTracker from '../../rxjs/ObservableTracker';
import SingleObservableTracker from '../../rxjs/SingleObservableTracker';

class FakeRetroTracker {
  private data = new Map();

  private subscribed = 0;

  private expectedRetroToken: string | null = null;

  public dispatch: () => void = () => {};

  public setExpectedToken(retroToken: string): void {
    this.expectedRetroToken = retroToken;
  }

  public setServerData(retroId: string, serverData: any): void {
    this.data.set(retroId, serverData);
  }

  public subscribe(
    retroId: string,
    retroToken: string,
    dispatchCallback: any,
    retroStateCallback: any,
  ): { unsubscribe: () => void } {
    if (this.expectedRetroToken && this.expectedRetroToken !== retroToken) {
      throw new Error(`Incorrect retro token: ${retroToken}`);
    }

    this.subscribed += 1;

    const serverData = this.data.get(retroId);
    if (!serverData) {
      throw new Error('not found');
    }

    dispatchCallback(this.dispatch);
    retroStateCallback(Object.assign({
      retro: null,
      error: null,
    }, serverData));

    return {
      unsubscribe: (): void => {
        this.subscribed -= 1;
      },
    };
  }
}

class FakeArchiveTracker {
  private data = new Map();

  private expectedRetroToken: string | null = null;

  public setExpectedToken(retroToken: string): void {
    this.expectedRetroToken = retroToken;
  }

  public setServerData(
    retroId: string,
    archiveId: string,
    archive: any,
  ): void {
    if (!this.data.has(retroId)) {
      this.data.set(retroId, new Map());
    }
    this.data.get(retroId).set(archiveId, archive);
  }

  public get(
    retroId: string,
    archiveId: string,
    retroToken: string,
  ): Observable<any> {
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
  ): Observable<{ archives: any[] }> {
    if (this.expectedRetroToken && this.expectedRetroToken !== retroToken) {
      return throwError(`Incorrect retro token: ${retroToken}`);
    }

    const archives: any[] = [];
    const serverData = this.data.get(retroId);
    if (serverData) {
      serverData.forEach((archive: any, archiveId: string) => {
        archives.push({
          id: archiveId,
          created: archive.created,
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

  public setServerData(userToken: string): void {
    this.userToken = userToken;
  }

  public async login(
    service: string,
    externalToken: string,
  ): Promise<string> {
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

  private data = new Map();

  public setServerData(retroId: string, retroToken: string): void {
    this.data.set(retroId, retroToken);
  }

  public async submitPassword(
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
}

class FakeRetroService {
  public capturedName: string | null = null;

  public capturedSlug: string | null = null;

  public capturedPassword: string | null = null;

  private id: string | null = null;

  public setServerData(retroId: string): void {
    this.id = retroId;
  }

  public async create({ name, slug, password }: any): Promise<string> {
    this.capturedName = name;
    this.capturedSlug = slug;
    this.capturedPassword = password;
    return this.id!;
  }
}

export const configService = new SingleObservableTracker();
export const retroListTracker = new ObservableTracker();
export const slugTracker = new ObservableTracker();
export const retroTracker = new FakeRetroTracker();
export const archiveTracker = new FakeArchiveTracker();
export const retroTokenService = new FakeRetroTokenService();
export const retroService = new FakeRetroService();
export const userTokenService = new FakeUserTokenService();

export const retroTokenTracker = new ObservableTracker();
export const userTokenTracker = new SingleObservableTracker();
