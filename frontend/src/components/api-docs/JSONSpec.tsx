import {
  Fragment,
  useState,
  type FunctionComponent,
  type ReactNode,
} from 'react';
import { classNames } from '../../helpers/classNames';
import { resolveRef, type JsonSchemaRef, type OpenApiSpec } from './schema';
import { inlineFormat } from './inlineFormat';
import './JSONSpec.css';

export const JSONSpec: FunctionComponent<{
  root: OpenApiSpec;
  entity: JsonSchemaRef;
  defaultOpen?: boolean;
}> = ({ root, entity, defaultOpen = false }) => {
  const [isOpen, setOpen] = useState(defaultOpen);

  const def = resolveRef(root, entity);
  let jsonType: string | undefined;
  let extra: ReactNode;
  if ('oneOf' in def) {
    if (def.oneOf.length === 1) {
      return <JSONSpec root={root} entity={def.oneOf[0]!} />;
    }
    jsonType = 'one of';
    extra = (
      <ul>
        {def.oneOf.map((sub, i) => (
          <li key={i}>
            <JSONSpec root={root} entity={sub} />
          </li>
        ))}
      </ul>
    );
  } else if ('enum' in def) {
    extra = (
      <>
        {def.enum.map((v, i) => (
          <Fragment key={i}>
            {i > 0 ? ' / ' : null}
            <code>{JSON.stringify(v)}</code>
          </Fragment>
        ))}
      </>
    );
  } else if (!def.type) {
    jsonType = 'any';
  } else if (def.type === 'boolean') {
    jsonType = 'boolean';
  } else if (def.type === 'integer') {
    if (def.format === 'unix-millis') {
      jsonType = 'UNIX timestamp';
      extra = (
        <>
          (milliseconds since <code>1970-01-01T00:00:00Z</code>)
        </>
      );
    } else {
      jsonType = 'integer';
    }
  } else if (def.type === 'number') {
    jsonType = 'number';
  } else if (def.type === 'string') {
    if (def.format === 'jwt') {
      jsonType = 'JSON Web Token';
    } else if (def.format === 'date-time') {
      jsonType = 'ISO 8601 datetime';
    } else if (def.format === 'uuid') {
      jsonType = 'UUID';
    } else {
      jsonType = 'string';
    }
  } else if (def.type === 'object') {
    const additional =
      def.additionalProperties === true ? {} : def.additionalProperties;
    jsonType = 'object';
    if (Object.keys(def.properties ?? {}).length || additional) {
      extra = (
        <>
          <code>{'{'}</code>
          <ul className="json-spec-object">
            {Object.entries(def.properties ?? {}).map(([key, sub]) => (
              <li key={key}>
                <code>{key}</code>:
                {def.required?.includes(key) ? ' ' : ' (optional) '}
                <JSONSpec root={root} entity={sub} />
              </li>
            ))}
            {additional ? (
              <li>
                {'*: '}
                <JSONSpec root={root} entity={additional} />
              </li>
            ) : null}
          </ul>
          <code>{'}'}</code>
        </>
      );
    } else {
      extra = <code>{'{}'}</code>;
    }
  } else if (def.type === 'array') {
    jsonType = 'array';
    extra = (
      <>
        <code>[</code>
        <JSONSpec root={root} entity={def.items ?? {}} />
        <code>]</code>
      </>
    );
  } else {
    jsonType = 'unknown';
  }

  const description = def.description ? (
    <div className="json-description"> {inlineFormat(def.description)}</div>
  ) : null;

  const toggle =
    def.title && extra ? (
      <button
        type="button"
        className={classNames('json-toggle', { active: isOpen })}
        onClick={() => setOpen(!isOpen)}
        aria-pressed={isOpen}
      >
        {def.title}
      </button>
    ) : null;

  if (toggle && !isOpen) {
    return (
      <>
        {toggle}
        {description}
      </>
    );
  } else {
    return (
      <>
        {toggle}
        {jsonType ? (
          <>
            <span className="json-type">
              {jsonType}
              {def.nullable ? '?' : ''}
            </span>
            {extra ? ' ' : ''}
          </>
        ) : null}
        {extra}
        {description}
      </>
    );
  }
};

export function makeExampleJSON(
  root: OpenApiSpec,
  entity: JsonSchemaRef,
  minimal: boolean,
): unknown {
  const def = resolveRef(root, entity);
  if (def.example !== undefined) {
    return def.example;
  }
  if (def.default !== undefined) {
    return def.default;
  }
  if (def.nullable && minimal) {
    return null;
  }
  if ('oneOf' in def) {
    if (!def.oneOf.length) {
      return null;
    }
    return makeExampleJSON(root, def.oneOf[0]!, minimal);
  }
  if ('enum' in def) {
    return def.enum[0];
  }
  switch (def.type) {
    case 'boolean':
      return true;
    case 'number':
      return 4.2;
    case 'integer':
      if (def.format === 'unix-millis') {
        return new Date('2000-01-02T12:34:56Z').getTime();
      }
      return 42;
    case 'string':
      if (def.format === 'jwt') {
        return '0000000000.0000000000000000000000000000000000000000.0000000000';
      } else if (def.format === 'date-time') {
        return '2000-01-02T12:34:56Z';
      } else if (def.format === 'uuid') {
        return '00000000-0000-0000-0000-000000000000';
      } else {
        return 'example';
      }
    case 'object':
      const available = Object.entries(def.properties ?? {});
      const props = available.filter(
        ([key]) => !minimal || def.required?.includes(key),
      );
      if (def.minProperties && minimal && props.length < def.minProperties) {
        props.push(
          ...available
            .filter(([key]) => !def.required?.includes(key))
            .slice(0, def.minProperties - props.length),
        );
      }
      if (!minimal && def.additionalProperties) {
        props.push([
          '*',
          def.additionalProperties === true ? {} : def.additionalProperties,
        ]);
      }
      return Object.fromEntries(
        props.map(([key, sub]) => [key, makeExampleJSON(root, sub, minimal)]),
      );
    case 'array':
      return [makeExampleJSON(root, def.items ?? {}, minimal)];
    default:
      return 'anything';
  }
}
