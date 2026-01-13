import { memo, useState, type ReactNode } from 'react';
import useAwaited from 'react-hook-awaited';
import { passwordService } from '../../api/api';
import { useConfig } from '../../hooks/data/useConfig';
import { Alert } from './Alert';

interface PropsT {
  /** included for password managers to distinguish between credentials */
  username?: string;
  /** a friendly name for password managers (but can be changed) */
  name?: string;
  label: ReactNode;
  confirmLabel: ReactNode;
  required?: boolean;
  password: string;
  setPassword: (value: string) => void;
  setMatches: (match: boolean) => void;
}

export const SetPassword = memo(
  ({
    username,
    name,
    label,
    confirmLabel,
    required,
    password,
    setPassword,
    setMatches,
  }: PropsT) => {
    const config = useConfig();
    const [passwordConf, setPasswordConf] = useState('');

    const passwordWarningRequest = useAwaited<ReactNode>(
      async (signal) => {
        if (!window.isSecureContext) {
          return (
            <>
              You are accessing Refacto over an insecure connection; other users
              on your network can see the password you enter{HTTPS_INFO_LINK}
            </>
          );
        }
        if (!password || password !== passwordConf) {
          return null;
        }

        if (password.length < (config?.passwordRequirements.minLength ?? 0)) {
          return <>This password is too short{PASSWORD_INFO_LINK}</>;
        }
        if (
          password.length >
          (config?.passwordRequirements.maxLength ?? Number.POSITIVE_INFINITY)
        ) {
          return <>This password is too long{PASSWORD_INFO_LINK}</>;
        }

        const count = await passwordService.countPasswordBreaches(
          password,
          signal,
        );
        if (count > 100) {
          return (
            <>This password is very common and insecure{PASSWORD_INFO_LINK}</>
          );
        } else if (count > 20) {
          return <>This password is common and insecure{PASSWORD_INFO_LINK}</>;
        } else if (count > 0) {
          return <>This password may be insecure{PASSWORD_INFO_LINK}</>;
        }
        return null;
      },
      [password, passwordConf],
    );

    const passwordWarning =
      passwordWarningRequest.state === 'resolved'
        ? passwordWarningRequest.data
        : null;

    return (
      <>
        {username && (
          <input
            type="hidden"
            name="username"
            value={username}
            autoComplete="username"
          />
        )}
        {name && (
          <input type="hidden" name="name" value={name} autoComplete="name" />
        )}
        <label>
          {label}
          <input
            name="password"
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => {
              setPassword(e.currentTarget.value);
              setMatches(e.currentTarget.value === passwordConf);
            }}
            minLength={config?.passwordRequirements.minLength}
            maxLength={config?.passwordRequirements.maxLength}
            autoComplete="new-password"
            required={required}
          />
        </label>
        <label>
          {confirmLabel}
          <input
            name="password-confirmation"
            type="password"
            placeholder="password"
            value={passwordConf}
            onChange={(e) => {
              setPasswordConf(e.currentTarget.value);
              setMatches(e.currentTarget.value === password);
            }}
            autoComplete="new-password"
            required={required}
          />
        </label>
        <Alert warning message={passwordWarning} />
      </>
    );
  },
);

const PASSWORD_INFO_LINK = (
  <>
    {' \u2014 '}
    <a href="/security#passwords" target="_blank" rel="noopener noreferrer">
      Learn more
    </a>
  </>
);

const HTTPS_INFO_LINK = (
  <>
    {' \u2014 '}
    <a
      href="https://www.cloudflare.com/learning/ssl/what-is-https/"
      target="_blank"
      rel="noopener noreferrer"
    >
      Learn more
    </a>
  </>
);
