import { memo } from 'react';
import { Header } from '../common/Header';
import { Anchor } from '../common/Anchor';
import './SecurityPage.css';

export const SecurityPage = memo(() => (
  <article className="page-security">
    <Header
      documentTitle="Privacy &amp; Security - Refacto"
      title="Privacy &amp; Security"
      backLink={{ label: 'Home', action: '/' }}
    />
    <section>
      <h2>
        <Anchor tag="single-sign-on" />
        Single Sign On
      </h2>
      <p>
        To create a new retro, a single-sign-on (SSO) provider must be used.
        Several providers are supported, and the data gathered is the minimum
        necessary to run this service. Specifically, a unique identifier is
        retrieved from the service. This identifier is unique to the account
        used, but is otherwise not identifiable (it contains no personal details
        such as name or email address). The created retro is associated with
        this unique ID.
      </p>
      <p>
        Note that some login providers (such as Google) will always make the
        email address of the person logging in available even when it is not
        requested, but Refacto ignores this information and does not record it.
      </p>
    </section>
    <section>
      <h2>
        <Anchor tag="passwords" />
        Passwords
      </h2>
      <p>
        The minimum requirement for passwords is that they be at least 8
        characters long. Beyond this there are no restrictions, but all
        passwords are checked against the{' '}
        <a
          href="https://haveibeenpwned.com/Passwords"
          target="_blank"
          rel="noopener noreferrer"
        >
          have i been pwned password database
        </a>
        , and if a match is found a warning is displayed.
      </p>
      <p>
        The password lookup uses{' '}
        <a
          href="https://www.troyhunt.com/ive-just-launched-pwned-passwords-version-2/#cloudflareprivacyandkanonymity"
          target="_blank"
          rel="noopener noreferrer"
        >
          k-Anonymity
        </a>{' '}
        to ensure that passwords are not leaked to external services.
      </p>
      <p>
        Once submitted, passwords are stored as hashes with individual salts to
        protect against database breaches.
      </p>
    </section>
    <section>
      <h2>
        <Anchor tag="retro-data" />
        Retro Data
      </h2>
      <p>
        This service takes several precautions to protect retro data against
        accidental or deliberate exposure (see the technical details below for
        more information), but should not be considered as a secure place to
        store information. In particular, passwords or similar sensitive data
        should never be entered into a retro. Anybody with knowledge of the
        retro URL and password can see the current data and all archived data.
      </p>
    </section>
    <section>
      <h2>
        <Anchor tag="analytics" />
        Analytics
      </h2>
      <p>
        Minimal analytics are recorded to identify bugs, track feature usage,
        and prioritise browser support. This does not involve sharing any data
        with third-parties, and proactively avoids recording unnecessary
        information (in particular: no personal or retro identifying data is
        recorded, and system information is limited to the minimum required for
        investigating issues). Cookies are not used. The details recorded are:
      </p>
      <ul>
        <li>Platform name (e.g. "Windows", "Android", "iPad")</li>
        <li>Browser name (e.g. "Chrome", "Firefox", "Safari")</li>
        <li>Browser major version (e.g. "130")</li>
        <li>Current UTC time</li>
        <li>Action (e.g. "create retro", "create archive", "export json").</li>
        <li>Total amount of time spent in a retro</li>
        <li>Error information / disconnection reason</li>
      </ul>
      <p>
        Users can opt out of tracking using standard browser mechanisms; both
        the Do Not Track (DNT) and Global Privacy Control (Sec-GPC) headers are
        respected if present (these can typically be turned on in the browser
        settings). When either of these are enabled, only errors will be
        recorded, and platform and browser information will not be included.
      </p>
    </section>
    <section>
      <Anchor tag="technical-details" />
      <h2>Technical Details</h2>
      <p>
        Further technical details on the privacy and security choices are
        available in the{' '}
        <a
          href="https://github.com/davidje13/Refacto/blob/main/docs/SECURITY.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          code repository documentation
        </a>
        .
      </p>
    </section>
  </article>
));
