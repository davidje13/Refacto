import { useState, useCallback, memo, ChangeEvent, ReactNode } from 'react';
import { type JsonData } from '../../shared/api-entities';
import { Input } from '../common/Input';
import { SlugEntry, MAX_SLUG_LENGTH } from './SlugEntry';
import { Alert } from '../common/Alert';
import { withUserToken } from '../hocs/withUserToken';
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

function makeSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9_]+/g, '-')
    .replace(/[-_]{2,}/g, '_')
    .replace(/^[-_]+|[-_]+$/g, '')
    .substr(0, MAX_SLUG_LENGTH);
}

function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject): void => {
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
  withUserToken(
    'Register an account to create a retro',
    ({ defaultSlug, userToken, onCreate, showImport = false }: PropsT) => {
      const [name, setName] = useState(defaultSlug || '');
      const [slug, setSlug] = useState(defaultSlug || '');
      const [password, setPassword] = useState('');
      const [passwordConf, setPasswordConfRaw] = useState('');
      const [passwordWarning, setPasswordWarning] = useState<string>();
      const [importJson, setImportJson] = useState<JsonData>();
      const [importError, setImportError] = useState<string>();

      const importNonce = useNonce();
      const handleImportChange = useCallback(
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
        [importNonce, setName, setSlug, setImportJson, setImportError],
      );

      const passwordCheckNonce = useNonce();
      const setPasswordConf = useCallback(
        async (current: string) => {
          const nonce = passwordCheckNonce.next();
          setPasswordConfRaw(current);
          setPasswordWarning(undefined);

          if (password !== current) {
            return;
          }

          if (current.length < MIN_PASSWORD_LENGTH) {
            setPasswordWarning('This password is too short');
            return;
          }
          if (current.length > MAX_PASSWORD_LENGTH) {
            setPasswordWarning('This password is too long');
            return;
          }

          try {
            const count = await passwordService.countPasswordBreaches(current);
            if (!passwordCheckNonce.check(nonce)) {
              return;
            }
            if (count > 100) {
              setPasswordWarning('This password is very common and insecure');
            } else if (count > 20) {
              setPasswordWarning('This password is common and insecure');
            } else if (count > 0) {
              setPasswordWarning('This password may be insecure');
            }
          } catch (err) {
            // ignore
          }
        },
        [
          password,
          setPasswordConfRaw,
          passwordCheckNonce,
          setPasswordWarning,
          passwordService,
          MIN_PASSWORD_LENGTH,
          MAX_PASSWORD_LENGTH,
        ],
      );

      const [handleSubmit, sending, error] = useSubmissionCallback(async () => {
        if (showImport && !importJson) {
          throw new Error('Must specify valid file to import');
        }

        const resolvedSlug = slug || makeSlug(name);
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
      }, [
        showImport,
        importJson,
        name,
        slug,
        password,
        passwordConf,
        userToken,
        onCreate,
      ]);

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
              placeholder={makeSlug(name)}
              value={slug}
              onChange={setSlug}
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
  ),
);
