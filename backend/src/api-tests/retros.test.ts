import request from 'superwstest';
import { TestLogger } from './TestLogger';
import { testConfig } from './testConfig';
import {
  createRetro,
  getRetroToken,
  getUserToken,
  testServerRunner,
} from './testServerRunner';
import { appFactory } from '../app';

describe('API retros', () => {
  const PROPS = testServerRunner(async () => {
    const app = await appFactory(new TestLogger(), testConfig());

    const hooks = app.testHooks;

    const { retroId, retroToken } = await createRetro(hooks, {
      ownerId: 'nobody',
      slug: 'my-retro',
      name: 'My Retro',
      password: 'password1',
    });

    await createRetro(hooks, {
      ownerId: 'me',
      slug: 'my-second-retro',
      name: 'My Second Retro',
    });

    await createRetro(hooks, {
      ownerId: 'nobody',
      slug: 'unknown-retro',
      name: 'An Unknown Retro Format',
      format: 'nope',
    });

    const userToken = getUserToken(hooks, 'me');

    return { run: app, hooks, retroId, userToken, retroToken };
  });

  describe('/api/retros', () => {
    it('responds with retros for the user in JSON format', async (props) => {
      const { server, userToken } = props.getTyped(PROPS);

      const response = await request(server)
        .get('/api/retros')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retros.length).toEqual(1);
      expect(response.body.retros[0].slug).toEqual('my-second-retro');
    });

    it('responds HTTP Unauthorized if no credentials are given', async (props) => {
      const { server } = props.getTyped(PROPS);

      await request(server).get('/api/retros').expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async (props) => {
      const { server } = props.getTyped(PROPS);

      await request(server)
        .get('/api/retros')
        .set('Authorization', 'Bearer Foo')
        .expect(401);
    });
  });

  describe('POST /api/retros', () => {
    it('creates a new retro', async (props) => {
      const { server, hooks, userToken } = props.getTyped(PROPS);

      const slug = 'new-retro';

      const response = await request(server)
        .post('/api/retros')
        .send({ slug, name: 'Meh', password: 'password' })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const storedId = await hooks.retroService.getRetroIdForSlug(slug);

      expect(response.body.id).toEqual(storedId);
      expect(response.body.token).toBeTruthy();
    });

    it('responds HTTP Unprocessable Entity if data is missing', async (props) => {
      const { server, userToken } = props.getTyped(PROPS);

      const response = await request(server)
        .post('/api/retros')
        .send({ slug: 'new-retro', name: 'Meh' })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(422);

      expect(response.body.error).toEqual('Expected string at .password');
    });

    it('responds HTTP Bad Request if data is blank', async (props) => {
      const { server, userToken } = props.getTyped(PROPS);

      const response = await request(server)
        .post('/api/retros')
        .send({ slug: 'new-retro', name: '', password: 'password' })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.error).toEqual('No name given');
    });

    it('responds HTTP Conflict if slug is unavailable', async (props) => {
      const { server, userToken } = props.getTyped(PROPS);

      const response = await request(server)
        .post('/api/retros')
        .send({ slug: 'my-retro', name: 'Meh', password: 'password' })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(409);

      expect(response.body.error).toEqual('URL is already taken');
    });

    it('responds HTTP Unauthorized if no credentials are given', async (props) => {
      const { server } = props.getTyped(PROPS);

      await request(server).post('/api/retros').expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async (props) => {
      const { server } = props.getTyped(PROPS);

      await request(server)
        .post('/api/retros')
        .set('Authorization', 'Bearer Foo')
        .expect(401);
    });
  });

  describe('GET /api/retros/retro-id', () => {
    it('returns the current retro state', async (props) => {
      const { server, hooks } = props.getTyped(PROPS);

      const id = (await hooks.retroService.getRetroIdForSlug('my-retro'))!;
      const retroToken = await getRetroToken(hooks, id);

      const response = await request(server)
        .get(`/api/retros/${id}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200);

      expect(response.body).toEqual({
        id,
        slug: 'my-retro',
        name: 'My Retro',
        ownerId: 'nobody',
        state: {},
        groupStates: {},
        format: 'mood',
        options: {},
        items: [],
        scheduledDelete: 0,
      });
    });

    it('filters retro items if requested', async (props) => {
      const { server, hooks, retroId, retroToken } = props.getTyped(PROPS);

      await hooks.retroService.retroBroadcaster.update(retroId, {
        items: [
          'push',
          {
            id: '00000000-0000-0000-0000-000000000001',
            category: 'happy',
            created: 946684800000,
            message: 'A good thing',
            attachment: null,
            votes: 0,
            doneTime: 0,
          },
          {
            id: '00000000-0000-0000-0000-000000000002',
            category: 'action',
            created: 946684800000,
            message: 'An action',
            attachment: null,
            votes: 0,
            doneTime: 0,
          },
        ],
      });

      const search = new URLSearchParams({
        items: '{"category":["=","action"]}',
      });
      const response = await request(server)
        .get(`/api/retros/${retroId}?${search}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.items).toEqual([
        {
          id: '00000000-0000-0000-0000-000000000002',
          category: 'action',
          created: 946684800000,
          message: 'An action',
          attachment: null,
          votes: 0,
          doneTime: 0,
        },
      ]);
    });

    it('rejects invalid item filters', async (props) => {
      const { server, retroId, retroToken } = props.getTyped(PROPS);

      await request(server)
        .get(`/api/retros/${retroId}?items=nope`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(400);
    });

    it('responds HTTP Unauthorized if no credentials are given', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server).get(`/api/retros/${retroId}`).expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .get(`/api/retros/${retroId}`)
        .set('Authorization', 'Bearer Foo')
        .expect(401);
    });

    it('responds HTTP Forbidden if scope is not "read"', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);

      const retroToken = await getRetroToken(hooks, retroId, {
        read: false,
      });

      await request(server)
        .get(`/api/retros/${retroId}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(403);
    });
  });

  describe('PATCH /api/retros/retro-id', () => {
    describe('with retro spec', () => {
      it('applies the spec to the retro', async (props) => {
        const { server, hooks, retroId, retroToken } = props.getTyped(PROPS);

        await request(server)
          .patch(`/api/retros/${retroId}`)
          .send({ change: { state: ['=', { foo: 'bar' }] } })
          .set('Authorization', `Bearer ${retroToken}`)
          .expect(200);

        const retro = await hooks.retroService.getRetro(retroId);
        expect(retro?.state).toEqual({ foo: 'bar' });
      });

      it('does not require "manage" scope', async (props) => {
        const { server, hooks, retroId } = props.getTyped(PROPS);

        const retroToken = await getRetroToken(hooks, retroId, {
          manage: false,
        });

        await request(server)
          .patch(`/api/retros/${retroId}`)
          .send({ change: { state: ['=', { foo: 'bar' }] } })
          .set('Authorization', `Bearer ${retroToken}`)
          .expect(200);

        const retro = await hooks.retroService.getRetro(retroId);
        expect(retro?.state).toEqual({ foo: 'bar' });
      });

      it('responds HTTP Forbidden if scope is not "write"', async (props) => {
        const { server, hooks, retroId } = props.getTyped(PROPS);

        const retroToken = await getRetroToken(hooks, retroId, {
          write: false,
        });

        await request(server)
          .patch(`/api/retros/${retroId}`)
          .send({ change: { state: ['=', { foo: 'bar' }] } })
          .set('Authorization', `Bearer ${retroToken}`)
          .expect(403);

        const retro = await hooks.retroService.getRetro(retroId);
        expect(retro?.state).toEqual({});
      });
    });

    describe('with new password', () => {
      it('changes the retro password', async (props) => {
        const { server, hooks, retroId } = props.getTyped(PROPS);

        const grant1 = await hooks.retroAuthService.grantForPassword(
          retroId,
          'password1',
        );
        if (!grant1) {
          throw new Error('failed to get retro token');
        }

        await request(server)
          .patch(`/api/retros/${retroId}`)
          .send({ setPassword: { password: 'password2', evictUsers: false } })
          .set('Authorization', `Bearer ${grant1.token}`)
          .expect(200)
          .expect('Content-Type', /application\/json/);

        // existing token is still valid
        expect(
          await hooks.retroAuthService.readAndVerifyToken(
            retroId,
            grant1.token,
          ),
        ).isTruthy();

        // new token requests must use new password
        expect(
          await hooks.retroAuthService.grantForPassword(retroId, 'password1'),
        ).isNull();

        const grant2 = await hooks.retroAuthService.grantForPassword(
          retroId,
          'password2',
        );
        expect(grant2).isTruthy();
        expect(
          await hooks.retroAuthService.readAndVerifyToken(
            retroId,
            grant2!.token,
          ),
        ).isTruthy();
      });

      it('voids existing tokens if requested', async (props) => {
        const { server, hooks, retroId } = props.getTyped(PROPS);

        const grant1 = await hooks.retroAuthService.grantForPassword(
          retroId,
          'password1',
        );
        if (!grant1) {
          throw new Error('failed to get retro token');
        }

        await request(server)
          .patch(`/api/retros/${retroId}`)
          .send({ setPassword: { password: 'password2', evictUsers: true } })
          .set('Authorization', `Bearer ${grant1.token}`)
          .expect(200)
          .expect('Content-Type', /application\/json/);

        // existing token is no longer valid
        expect(
          await hooks.retroAuthService.readAndVerifyToken(
            retroId,
            grant1.token,
          ),
        ).isNull();

        // new tokens are valid
        const grant2 = await hooks.retroAuthService.grantForPassword(
          retroId,
          'password2',
        );
        expect(grant2).isTruthy();
        expect(
          await hooks.retroAuthService.readAndVerifyToken(
            retroId,
            grant2!.token,
          ),
        ).isTruthy();
      });

      it('does not require "write" scope', async (props) => {
        const { server, hooks, retroId } = props.getTyped(PROPS);

        const retroToken = await getRetroToken(hooks, retroId, {
          write: false,
        });

        await request(server)
          .patch(`/api/retros/${retroId}`)
          .send({ setPassword: { password: 'password2', evictUsers: false } })
          .set('Authorization', `Bearer ${retroToken}`)
          .expect(200);
      });

      it('responds HTTP Forbidden if scope is not "manage"', async (props) => {
        const { server, hooks, retroId } = props.getTyped(PROPS);

        const retroToken = await getRetroToken(hooks, retroId, {
          manage: false,
        });

        await request(server)
          .patch(`/api/retros/${retroId}`)
          .send({ setPassword: { password: 'password2', evictUsers: false } })
          .set('Authorization', `Bearer ${retroToken}`)
          .expect(403);
      });
    });

    it('responds HTTP Unauthorized if no credentials are given', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .patch(`/api/retros/${retroId}`)
        .send({ setPassword: { password: 'password2', evictUsers: false } })
        .expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .patch(`/api/retros/${retroId}`)
        .send({ setPassword: { password: 'password2', evictUsers: false } })
        .set('Authorization', 'Bearer Foo')
        .expect(401);
    });
  });

  describe('DELETE /api/retros/retro-id', () => {
    it('schedules retro deletion', async (props) => {
      const { server, retroId, retroToken } = props.getTyped(PROPS);

      const begin = Date.now();
      const response = await request(server)
        .delete(`/api/retros/${retroId}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(202);

      expect(response.body.scheduledTime).toBeGreaterThan(begin);
    });

    it('responds HTTP Forbidden if scope is not "manage"', async (props) => {
      const { server, hooks, retroId } = props.getTyped(PROPS);

      const retroToken = await getRetroToken(hooks, retroId, {
        manage: false,
      });

      await request(server)
        .delete(`/api/retros/${retroId}`)
        .set('Authorization', `Bearer ${retroToken}`)
        .expect(403);
    });

    it('responds HTTP Unauthorized if no credentials are given', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server).delete(`/api/retros/${retroId}`).expect(401);
    });

    it('responds HTTP Unauthorized if credentials are incorrect', async (props) => {
      const { server, retroId } = props.getTyped(PROPS);

      await request(server)
        .delete(`/api/retros/${retroId}`)
        .set('Authorization', 'Bearer Foo')
        .expect(401);
    });
  });
});

describe('API retros with my retros disabled', () => {
  const PROPS = testServerRunner(async () => {
    const app = await appFactory(
      new TestLogger(),
      testConfig({ permit: { myRetros: false } }),
    );

    const hooks = app.testHooks;
    const userToken = getUserToken(hooks, 'me');
    const { retroId, retroToken } = await createRetro(hooks);
    return { run: app, hooks, userToken, retroId, retroToken };
  });

  describe('/api/retros', () => {
    it('returns no retros', async (props) => {
      const { server, userToken } = props.getTyped(PROPS);

      const response = await request(server)
        .get('/api/retros')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.retros.length).toEqual(0);
    });
  });

  describe('POST /api/retros', () => {
    it('includes an access token in the response', async (props) => {
      const { server, userToken } = props.getTyped(PROPS);

      const response = await request(server)
        .post('/api/retros')
        .send({ slug: 'new-retro', name: 'Meh', password: 'password' })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      // requesting a token later will fail, but the initial creation still gives a token
      expect(response.body.token).toBeTruthy();
    });
  });
});

describe('delete with no delay', () => {
  const PROPS = testServerRunner(async () => {
    const app = await appFactory(
      new TestLogger(),
      testConfig({ deleteRetroDelay: 0 }),
    );

    const hooks = app.testHooks;
    const { retroId, retroToken } = await createRetro(hooks);
    return { run: app, hooks, retroId, retroToken };
  });

  it('deletes a retro immediately', async (props) => {
    const { server, hooks, retroId, retroToken } = props.getTyped(PROPS);

    await request(server)
      .delete(`/api/retros/${retroId}`)
      .set('Authorization', `Bearer ${retroToken}`)
      .expect(200);

    expect(await hooks.retroService.getRetro(retroId)).toBeNull();
    expect(
      await hooks.retroAuthService.grantToken(retroId, 1000, { scopes: {} }),
    ).toBeNull();
  });
});

describe('delete not permitted', () => {
  const PROPS = testServerRunner(async () => {
    const app = await appFactory(
      new TestLogger(),
      testConfig({ deleteRetroDelay: -1 }),
    );

    const hooks = app.testHooks;
    const { retroId, retroToken } = await createRetro(hooks);
    return { run: app, hooks, retroId, retroToken };
  });

  it('responds HTTP Forbidden', async (props) => {
    const { server, hooks, retroId, retroToken } = props.getTyped(PROPS);

    await request(server)
      .delete(`/api/retros/${retroId}`)
      .set('Authorization', `Bearer ${retroToken}`)
      .expect(403);

    expect(await hooks.retroService.getRetro(retroId)).not(toBeNull());
  });
});
