import { useState, memo, ChangeEvent, ReactNode } from 'react';
import useAwaited from 'react-hook-awaited';
import { type JsonData } from '../../shared/api-entities';
import { useEvent } from '../../hooks/useEvent';
import { Input } from '../common/Input';
import { SlugEntry } from './SlugEntry';
import { Alert } from '../common/Alert';
import { makeValidSlug } from '../../hooks/data/useSlugAvailability';
import { useSubmissionCallback } from '../../hooks/useSubmissionCallback';
import { useNonce } from '../../hooks/useNonce';
import {
  retroService,
  retroTokenTracker,
  passwordService,
} from '../../api/api';
import './RetroForm.less';

export interface CreationT {
  id: string;
  name: string;
  slug: string;
  password: string;
}

interface PropsT {
  defaultSlug?: string | undefined;
  userToken: string;
  onCreate: (data: CreationT) => void;
  showImport?: boolean;
}

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 512;

function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      resolve(reader.result as string);
    });
    reader.addEventListener('error', () => {
      reject();
    });
    reader.readAsText(file, 'utf-8');
  });
}

export const RetroForm = memo(
  ({ defaultSlug, userToken, onCreate, showImport = false }: PropsT) => {
    const [name, setName] = useState(defaultSlug || '');
    const [slug, setSlug] = useState(defaultSlug || '');
    const [password, setPassword] = useState('');
    const [passwordConf, setPasswordConf] = useState('');
    const [importJson, setImportJson] = useState<JsonData>();
    const [importError, setImportError] = useState<string>();

    const importNonce = useNonce();
    const handleImportChange = useEvent(
      async (e: ChangeEvent<HTMLInputElement>) => {
        const file = (e.target.files || [])[0];
        setImportJson(undefined);
        setImportError(undefined);
        if (!file) {
          return;
        }
        const nonce = importNonce.next();
        try {
          const content = await readFileText(file);
          if (!importNonce.check(nonce)) {
            return;
          }

          const json = JSON.parse(content);
          setName(String(json.name || ''));
          setSlug(String(json.url || ''));
          setImportJson(json);
        } catch (err: unknown) {
          if (err instanceof Error) {
            setImportError(err.message);
          } else {
            setImportError('Internal error');
          }
        }
      },
    );

    const passwordWarningRequest = useAwaited(
      async (signal) => {
        if (!password || password !== passwordConf) {
          return;
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
          return 'This password is too short';
        }
        if (password.length > MAX_PASSWORD_LENGTH) {
          return 'This password is too long';
        }

        const count = await passwordService.countPasswordBreaches(
          password,
          signal,
        );
        if (count > 100) {
          return 'This password is very common and insecure';
        } else if (count > 20) {
          return 'This password is common and insecure';
        } else if (count > 0) {
          return 'This password may be insecure';
        }
        return '';
      },
      [password, passwordConf],
    );

    const passwordWarning =
      passwordWarningRequest.state === 'resolved'
        ? passwordWarningRequest.data
        : '';

    const [handleSubmit, sending, error] = useSubmissionCallback(async () => {
      if (showImport && !importJson) {
        throw new Error('Must specify valid file to import');
      }

      const resolvedSlug = slug || makeValidSlug(name);
      if (!name || !password || !resolvedSlug) {
        throw new Error('Must specify name, password and URL');
      }

      if (password !== passwordConf) {
        throw new Error('Passwords do not match');
      }

      const { id, token } = await retroService.create({
        name,
        slug: resolvedSlug,
        password,
        userToken,
        importJson,
      });

      retroTokenTracker.set(id, token);
      onCreate({
        id,
        slug: resolvedSlug,
        name,
        password,
      });
    });

    let importComponent: ReactNode = null;
    if (showImport) {
      importComponent = (
        <label>
          Import JSON File
          <input
            name="import"
            type="file"
            accept="application/json"
            onChange={handleImportChange}
            required
          />
        </label>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="create-retro">
        {importComponent}
        <Alert message={importError} />
        <label>
          Retro Name
          <Input
            name="name"
            type="text"
            placeholder="retro name"
            value={name}
            onChange={setName}
            required
          />
        </label>
        <label>
          Retro URL
          <div className="info">
            (may contain lowercase letters, numbers, dashes and underscores)
          </div>
          <SlugEntry
            placeholder={makeValidSlug(name)}
            ariaLabel="Retro ID (leave blank for an auto-generated ID)"
            value={slug}
            onChange={setSlug}
            showAvailability
          />
        </label>
        <label>
          Collaborator password
          <Input
            name="password"
            type="password"
            placeholder="password"
            value={password}
            onChange={setPassword}
            minLength={MIN_PASSWORD_LENGTH}
            maxLength={MAX_PASSWORD_LENGTH}
            required
          />
        </label>
        <label>
          Confirm password
          <Input
            name="password-confirmation"
            type="password"
            placeholder="password"
            value={passwordConf}
            onChange={setPasswordConf}
            required
          />
        </label>
        <Alert
          warning
          message={passwordWarning}
          show={Boolean(passwordWarning)}
        >
          {' \u2014 '}
          <a
            href="/security#passwords"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more
          </a>
        </Alert>
        {sending ? (
          <div className="sending">&hellip;</div>
        ) : (
          <button type="submit" title="Create Retro">
            Create
          </button>
        )}
        <Alert message={error} />
      </form>
    );
  },
);
