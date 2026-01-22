import { useState, memo, type ChangeEvent, type ReactNode } from 'react';
import type { JsonData } from '../../shared/api-entities';
import { useEvent } from '../../hooks/useEvent';
import { SlugEntry } from './SlugEntry';
import { Alert } from '../common/Alert';
import { SetPassword } from '../common/SetPassword';
import { makeValidSlug } from '../../hooks/data/useSlugAvailability';
import { useSubmissionCallback } from '../../hooks/useSubmissionCallback';
import { useNonce } from '../../hooks/useNonce';
import { retroService, retroAuthTracker } from '../../api/api';
import './RetroForm.css';

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
    const [passwordMatches, setPasswordMatches] = useState(false);
    const [password, setPassword] = useState('');
    const [importJson, setImportJson] = useState<JsonData>();
    const [importError, setImportError] = useState<string>();

    const importNonce = useNonce();
    const handleImportChange = useEvent(
      async (e: ChangeEvent<HTMLInputElement>) => {
        const file = (e.currentTarget.files || [])[0];
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
        } catch (err) {
          if (err instanceof Error) {
            setImportError(err.message);
          } else {
            setImportError('Internal error');
          }
        }
      },
    );

    const [handleSubmit, sending, error] = useSubmissionCallback(async () => {
      if (showImport && !importJson) {
        throw new Error('Must specify valid file to import');
      }

      const resolvedSlug = slug || makeValidSlug(name);
      if (!name || !password || !resolvedSlug) {
        throw new Error('Must specify name, password and URL');
      }

      if (!passwordMatches) {
        throw new Error('Passwords do not match');
      }

      const { id, token, scopes, expires } = await retroService.create({
        name,
        slug: resolvedSlug,
        password,
        userToken,
        importJson,
      });

      retroAuthTracker.set(id, { retroToken: token, scopes, expires });
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
      <form onSubmit={handleSubmit} className="global-form create-retro">
        {importComponent}
        <Alert message={importError} />
        <label>
          Retro Name
          <input
            name="name"
            type="text"
            placeholder="retro name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            autoComplete="off"
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
        <SetPassword
          label="Collaborator password"
          confirmLabel="Confirm password"
          required
          password={password}
          setPassword={setPassword}
          setMatches={setPasswordMatches}
        />
        <button
          type="submit"
          className="wide-button"
          title="Create Retro"
          disabled={sending}
        >
          {sending ? '\u2026' : 'Create'}
        </button>
        <Alert message={error} />
      </form>
    );
  },
);
