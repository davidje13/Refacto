import { Fragment, memo, type FunctionComponent, type ReactNode } from 'react';
import { TabControl } from '../common/TabControl';
import { Anchor } from '../common/Anchor';
import {
  resolveRef,
  resolveSecurity,
  type MethodSpec,
  type OpenApiSpec,
  type RequestSpec,
  type ResponseSpec,
  type SecuritySchemeSpec,
} from './schema';
import { inlineFormat } from './inlineFormat';
import { RestExample } from './RestExample';
import { JSONSpec } from './JSONSpec';

interface EndpointListPropsT {
  spec: OpenApiSpec;
  demoBasePath: string;
  defaults: Record<string, string> | null;
}

export const EndpointList = memo(
  ({ spec, demoBasePath, defaults }: EndpointListPropsT) => {
    const elements: ReactNode[] = [];
    const displayBasePath = spec.servers?.[0]?.url ?? '';
    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const [method, def] of Object.entries(methods)) {
        elements.push(
          <Endpoint
            key={`${method}-${path}`}
            spec={spec}
            displayBasePath={displayBasePath}
            demoBasePath={demoBasePath}
            method={method}
            path={path}
            def={def}
            defaults={defaults ?? EMPTY_DEFAULTS}
          />,
        );
      }
    }
    return <>{elements}</>;
  },
);

interface EndpointPropsT {
  spec: OpenApiSpec;
  displayBasePath: string;
  demoBasePath: string;
  method: string;
  path: string;
  def: MethodSpec;
  defaults: Record<string, string>;
}

const Endpoint = memo(
  ({
    spec,
    displayBasePath,
    demoBasePath,
    method,
    path,
    def,
    defaults,
  }: EndpointPropsT) => (
    <details className="endpoint">
      <Anchor
        tag="summary"
        name={`${method}-${path}`
          .replaceAll(/[^a-zA-Z0-9]+/g, '-')
          .replace(/-$/, '')}
        onVisit={(o) => {
          const details = o.parentElement;
          if (details instanceof HTMLDetailsElement) {
            details.open = true;
          }
        }}
      >
        <h3>
          <code>
            {method.toUpperCase()} {displayBasePath + path}
          </code>
        </h3>
        <p>{inlineFormat(def.summary)}</p>
      </Anchor>
      {def.description ? <p>{inlineFormat(def.description)}</p> : null}
      <section>
        <h4>Authorization</h4>
        <TabControl
          tabs={(def.security ?? []).map((requirements, i) => {
            return {
              key: String(i),
              title: Object.entries(requirements)
                .map(([id]) => securityName(resolveSecurity(spec, id)))
                .join(' + '),
              content: <Security root={spec} requirements={requirements} />,
            };
          })}
          emptyState={<p>No authorization required.</p>}
        />
      </section>
      <section>
        <h4>Request</h4>
        <TabControl
          tabs={Object.entries(def.requestBody?.content ?? {}).map(
            ([mime, req]) => ({
              key: mime,
              title: mime,
              content: <Request root={spec} req={req} />,
            }),
          )}
          emptyState={<p>No request body.</p>}
        />
      </section>
      <section>
        <h4>Response</h4>
        <TabControl
          tabs={Object.entries(def.responses).map(([status, res]) => ({
            key: status,
            title: `HTTP ${status}`,
            content: <Response root={spec} res={resolveRef(spec, res)} />,
          }))}
        />
      </section>
      <section>
        <h4>Example</h4>
        <RestExample
          root={spec}
          method={method}
          path={path}
          def={def}
          basePath={demoBasePath}
          defaults={defaults}
        />
      </section>
    </details>
  ),
);

const EMPTY_DEFAULTS = {};

const securityName = (sec: SecuritySchemeSpec) => {
  if (sec.type === 'http' && sec.scheme === 'bearer') {
    return `HTTP Bearer${sec.bearerFormat ? ` (${sec.bearerFormat})` : ''}`;
  } else {
    return 'other';
  }
};

const Security: FunctionComponent<{
  root: OpenApiSpec;
  requirements: { [id: string]: string[] };
}> = ({ root, requirements }) => (
  <>
    {Object.entries(requirements).map(([id, scopes], j) => {
      const secDef = resolveSecurity(root, id);
      let info: ReactNode = null;
      if (secDef.type === 'http' && secDef.scheme === 'bearer') {
        info = (
          <>
            HTTP Bearer auth
            {secDef.bearerFormat ? <> using {secDef.bearerFormat}</> : null}
            {scopes.length ? ` with scopes: ${scopes.join(', ')}` : null}.
          </>
        );
      }
      return (
        <Fragment key={j}>
          {j > 0 ? (
            <p>
              <em>and</em>
            </p>
          ) : null}
          {info ? <p>{info}</p> : null}
          <p>{inlineFormat(secDef.description)}</p>
        </Fragment>
      );
    })}
  </>
);

const Request: FunctionComponent<{
  root: OpenApiSpec;
  req: RequestSpec;
}> = ({ root, req }) => (
  <div className="json-spec">
    <JSONSpec root={root} entity={req.schema ?? {}} defaultOpen />
  </div>
);

const Response: FunctionComponent<{
  root: OpenApiSpec;
  res: ResponseSpec;
}> = ({ root, res }) => (
  <>
    <p>{inlineFormat(res.description)}</p>
    <TabControl
      tabs={Object.entries(res.content ?? {}).map(([mime, body]) => ({
        key: mime,
        title: <code>{mime}</code>,
        content: body.schema ? (
          <div className="json-spec">
            <JSONSpec root={root} entity={body.schema} defaultOpen />
          </div>
        ) : (
          <p>(no content)</p>
        ),
      }))}
      emptyState={<p>No response body.</p>}
    />
  </>
);
