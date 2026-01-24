import {
  Fragment,
  memo,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react';
import { replaceAll } from '../../helpers/replaceAll';
import { resolveRef, type MethodSpec, type OpenApiSpec } from './schema';
import { makeExampleJSON } from './JSONSpec';

interface PropsT {
  root: OpenApiSpec;
  method: string;
  path: string;
  def: MethodSpec;
  basePath: string;
  defaults: Record<string, string>;
}

export const RestExample = memo(
  ({ root, method, path, def, basePath, defaults }: PropsT) => {
    const [resetter, setResetter] = useState(0);
    useLayoutEffect(() => {
      setResetter((v) => v + 1);
    }, [defaults]);

    const [response, setResponse] = useState<
      | { state: 'init' }
      | { state: 'running' }
      | { state: 'error'; error: string }
      | { state: 'done'; content: ReactNode[] }
    >({ state: 'init' });
    const [contentType, contentTypePicker] = useSelect(
      'content-type',
      Object.entries(def.requestBody?.content ?? {}).map(([mime, def]) => ({
        label: mime,
        value: { mime, def },
      })),
    );

    const base = new URL(basePath, document.location.href);

    const queries = (def.parameters ?? []).filter((p) => p.in === 'query');

    const parts: ReactNode[] = [
      `${method.toUpperCase()} `,
      base.pathname,
      ...replaceAll(path, /\{([^{}]+)\}/g, ([_, name]) => {
        const spec = def.parameters?.find(
          (p) => p.in === 'path' && p.name === name,
        );
        const schema = spec?.schema ? resolveRef(root, spec.schema) : undefined;
        return (
          <input
            type="text"
            key={`path-${name}-${resetter}`}
            name={`path-${name}`}
            placeholder={name}
            defaultValue={defaults[name!] ?? spec?.example ?? ''}
            pattern={schema?.type === 'string' ? schema.pattern : undefined}
            required
          />
        );
      }),
      ...queries.map((query, i) => {
        const content = Object.values(query.content ?? {});
        const schema = query.schema
          ? resolveRef(root, query.schema)
          : content.length
            ? resolveRef(root, content[0]!.schema)
            : undefined;
        const example =
          query.example ??
          JSON.stringify(makeExampleJSON(root, schema ?? {}, true));
        return (
          <Fragment key={`query-${query.name}`}>
            {i === 0 ? '?' : '&'}
            <label>
              {query.name}=
              <input
                type="text"
                name={`query-${query.name}`}
                placeholder={query.default ?? ''}
                defaultValue={query.required ? example : ''}
                pattern={schema?.type === 'string' ? schema.pattern : undefined}
                required={query.required}
              />
            </label>
          </Fragment>
        );
      }),
      ` HTTP/1.1\n`,
      `Host: ${base.origin}\n`,
    ];

    if (def.security?.length) {
      const securityParts = Object.keys(def.security[0]!);
      if (securityParts.length) {
        const sec = root.components.securitySchemes[securityParts[0]!];
        if (sec?.type === 'http') {
          parts.push(
            'Authorization: Bearer ',
            <input
              type="password"
              key={`http-bearer-auth-${resetter}`}
              name="http-bearer-auth"
              placeholder={sec.bearerFormat ?? 'token'}
              defaultValue={defaults[sec.bearerFormat ?? ''] ?? ''}
              required
            />,
            '\n',
          );
        }
      }
    }
    if (contentTypePicker) {
      parts.push('Content-Type: ', contentTypePicker, '\n');
    }
    parts.push('\n');
    if (contentType) {
      const defaultBody = contentType.def.schema
        ? JSON.stringify(
            makeExampleJSON(root, contentType.def.schema, true),
            null,
            2,
          )
        : '';
      parts.push(
        <textarea
          key="request-body"
          name="request-body"
          defaultValue={defaultBody}
          rows={defaultBody.split('\n').length}
        />,
      );
    }

    return (
      <form
        action="#"
        onSubmit={async (e) => {
          const form = e.currentTarget;
          e.preventDefault();
          if (response.state === 'running') {
            return;
          }
          setResponse({ state: 'running' });
          const findElement = (name: string) =>
            form.elements.namedItem(name) as HTMLInputElement | null;
          try {
            const headers: HeadersInit = {};
            const bearer = findElement('http-bearer-auth');
            if (bearer) {
              headers['authorization'] = `Bearer ${bearer.value}`;
            }
            if (contentType) {
              headers['content-type'] = contentType.mime;
            }
            const search = new URLSearchParams();
            for (const query of queries) {
              const value = findElement(`query-${query.name}`)!.value;
              if (value) {
                search.append(query.name, value);
              }
            }
            const response = await fetch(
              base.href +
                path.replaceAll(/\{([^{}]+)\}/g, (_, name) =>
                  encodeURIComponent(findElement(`path-${name}`)!.value),
                ) +
                (search.size ? `?${search}` : ''),
              {
                method: method.toUpperCase(),
                headers,
                body: findElement('request-body')?.value ?? null,
              },
            );
            setResponse({
              state: 'done',
              content: await readResponse(root, def, response),
            });
          } catch (err) {
            setResponse({
              state: 'error',
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }}
      >
        <pre className="rest-request">
          <code>{parts}</code>
        </pre>
        <button
          type="submit"
          className="global-button primary rest-run"
          disabled={response.state === 'running'}
        >
          Run
        </button>
        {response.state === 'running' ? (
          <p>Running&hellip;</p>
        ) : response.state === 'error' ? (
          <p>Error: {response.error}</p>
        ) : response.state === 'done' ? (
          <pre className="rest-response">
            <code>{response.content}</code>
          </pre>
        ) : (
          <pre className="rest-response example">
            <code>{makeExampleResponse(root, def)}</code>
          </pre>
        )}
      </form>
    );
  },
);

function makeExampleResponse(root: OpenApiSpec, def: MethodSpec): ReactNode[] {
  const firstRes = Object.entries(def.responses)[0];
  if (!firstRes) {
    return ['-'];
  }

  const out: ReactNode[] = [
    `HTTP/1.1 ${firstRes[0]} ${STATUS_TEXT.get(firstRes[0])}\n`,
  ];

  const res = resolveRef(root, firstRes[1]);
  const firstMime = Object.entries(res.content ?? {})[0];
  for (const [header, headerDef] of Object.entries(res.headers ?? {})) {
    out.push(`${header}: ${headerDef.example ?? '*'}\n`);
  }
  if (firstMime) {
    out.push(`Content-Type: ${firstMime[0]}\n`);
  }
  out.push('\n');

  if (firstMime) {
    const isJSON = firstMime[0] === 'application/json';
    const content = firstMime[1];
    if (content.example) {
      if (isJSON || typeof content.example !== 'string') {
        out.push(JSON.stringify(content.example, null, 2));
      } else {
        out.push(content.example);
      }
    } else if (isJSON && content.schema) {
      out.push(
        JSON.stringify(makeExampleJSON(root, content.schema, false), null, 2),
      );
    }
  }

  return out;
}

const STATUS_TEXT = new Map([
  ['200', 'OK'],
  ['400', 'Bad Request'],
  ['401', 'Unauthorized'],
  ['403', 'Forbidden'],
  ['404', 'Not Found'],
  ['409', 'Conflict'],
  ['413', 'Content Too Large'],
  ['415', 'Unsupported Media Type'],
  ['422', 'Unprocessable Content'],
  ['500', 'Internal Server Error'],
]);

async function readResponse(
  root: OpenApiSpec,
  def: MethodSpec,
  response: Response,
): Promise<ReactNode[]> {
  const expectedHeaders = new Set(ALWAYS_ALLOW_HEADERS);
  for (const resRef of Object.values(def.responses)) {
    const res = resolveRef(root, resRef);
    for (const header of Object.keys(res.headers ?? {})) {
      expectedHeaders.add(header.toLowerCase());
    }
  }

  // HTTP/2 does not support status text, but we want to show the message as
  // if it had been performed using HTTP/1.1, so try to lookup a standard
  // status message if the server did not include one.
  const statusText =
    response.statusText || STATUS_TEXT.get(String(response.status)) || '';
  const out: ReactNode[] = [`HTTP/1.1 ${response.status} ${statusText}\n`];
  for (const [header, value] of response.headers) {
    if (expectedHeaders.has(header.toLowerCase())) {
      out.push(`${header}: ${value}\n`);
    }
  }
  out.push('\n');
  const responseBodyText = await response.text();
  if (response.headers.get('content-type') === 'application/json') {
    try {
      const responseBodyJson = JSON.parse(responseBodyText);
      out.push(JSON.stringify(responseBodyJson, null, 2));
    } catch {
      out.push(responseBodyText);
    }
  } else {
    out.push(responseBodyText);
  }
  return out;
}

const ALWAYS_ALLOW_HEADERS = new Set(['content-type', 'location']);

const useSelect = <T,>(
  name: string,
  options: { label: string; value: T }[],
): [choice: T | null, select: ReactNode | null] => {
  const [selected, setSelected] = useState('');
  if (!options.length) {
    return [null, null];
  }
  if (options.length === 1) {
    const opt = options[0]!;
    return [opt.value, opt.label];
  }
  const choice =
    (options.find((o) => o.label === selected) ?? options[0])?.value ?? null;
  const select = (
    <select
      key={name}
      name={name}
      value={selected}
      onChange={(e) => setSelected(e.currentTarget.value)}
    >
      {options.map(({ label }) => (
        <option key={label} value={label}>
          {label}
        </option>
      ))}
    </select>
  );
  return [choice, select];
};
