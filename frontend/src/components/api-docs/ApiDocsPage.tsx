import { memo } from 'react';
import useAwaited from 'react-hook-awaited';
import { API_BASE, retroAuthService } from '../../api/api';
import { jsonFetch } from '../../api/jsonFetch';
import { useAsyncValue } from '../../hooks/useAsyncValue';
import { useUserData } from '../../hooks/data/useUserData';
import { useRetroList } from '../../hooks/data/useRetroList';
import { useRelativeURL } from '../../hooks/env/useRelativeURL';
import { LoginForm } from '../login/LoginForm';
import { Header } from '../common/Header';
import { Anchor } from '../common/Anchor';
import { AsyncValue } from '../../helpers/AsyncValue';
import type { OpenApiSpec } from './schema';
import { EndpointList } from './EndpointList';
import './ApiDocsPage.css';

const SCHEMA_PATH = `${API_BASE}/openapi.json`;

export const apiSpec = AsyncValue.withProducer((signal) =>
  jsonFetch<OpenApiSpec>(SCHEMA_PATH, { signal }),
);

export const ApiDocsPage = memo(() => {
  const spec = useAsyncValue(apiSpec);
  const userData = useUserData();
  const [retroList] = useRetroList(userData);
  const url = useRelativeURL();

  const defaults = useAwaited(
    async (signal) => {
      if (!userData) {
        return null;
      }
      const defs: Record<string, string> = {};
      defs['user token'] = userData.userToken;
      if (retroList?.length) {
        const retro = retroList[0]!;
        defs['retro_id'] = retro.id;
        defs['slug'] = retro.slug;
        const retroAuth = await retroAuthService.getRetroAuthForUser(
          retro.id,
          userData.userToken,
          signal,
        );
        defs['retro token'] = retroAuth.retroToken;
      }
      return defs;
    },
    [userData, retroList],
  );

  return (
    <article className="page-api-docs global-article">
      <Header
        documentTitle="API Documentation - Refacto"
        title="API Documentation"
        backLink={{ label: 'Home', action: '/' }}
      />
      <section>
        <Anchor tag="h2" name="overview">
          Overview
        </Anchor>
        <p>
          Refacto provides a REST API which can be used to read and interact
          with retros via external tools.
        </p>
        <p>
          OpenAPI interface specification:{' '}
          <a href={SCHEMA_PATH} target="_blank" rel="noopener noreferrer">
            {SCHEMA_PATH}
          </a>
        </p>
      </section>
      <section>
        <Anchor tag="h2" name="authentication">
          Authentication
        </Anchor>
        <p>
          Bearer tokens (specifically JSON Web Tokens) sent in the{' '}
          <code>Authorization</code> header are used for authentication. The
          necessary token depends on the endpoint: some do not require any
          authentication, some require a user token, and some require a retro
          token.
        </p>
      </section>
      <section>
        <Anchor tag="h2" name="live-demo">
          Live Demo
        </Anchor>
        {defaults.state === 'pending' ? (
          <p>Loading tokens&hellip;</p>
        ) : defaults.state === 'rejected' ? (
          <p>Failed to load tokens for examples.</p>
        ) : !userData ? (
          <>
            <p>Log in to pre-populate tokens in the examples below</p>
            <LoginForm redirect={url} />
          </>
        ) : retroList?.length ? (
          <p>
            The examples below have been pre-populated using your user token,
            and your retro token for &ldquo;<bdi>{retroList[0]!.name}</bdi>
            &rdquo;.
          </p>
        ) : (
          <p>
            The examples below have been pre-populated using your user token.
          </p>
        )}
      </section>
      <section className="wide">
        <Anchor tag="h2" name="endpoints">
          Endpoints
        </Anchor>
        {spec[1] ? (
          <p>Failed to load API spec: {spec[1].message}</p>
        ) : spec[0] ? (
          <EndpointList
            spec={spec[0]}
            demoBasePath={API_BASE}
            defaults={defaults.latestData ?? null}
          />
        ) : (
          <p>Loading endpoint definitions&hellip;</p>
        )}
      </section>
    </article>
  );
});
