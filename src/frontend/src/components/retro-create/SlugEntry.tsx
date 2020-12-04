import React, {
  useState,
  useCallback,
  useEffect,
  memo,
} from 'react';
import Input from '../common/Input';
import useNonce from '../../hooks/useNonce';
import { slugTracker } from '../../api/api';
import { ReactComponent as TickBold } from '../../../resources/tick-bold.svg';
import { ReactComponent as Cross } from '../../../resources/cross.svg';

export const MAX_SLUG_LENGTH = 64;
const VALID_SLUG_PATTERN = '^[a-z0-9][a-z0-9_-]*$';
const VALID_SLUG = new RegExp(VALID_SLUG_PATTERN);

enum SlugAvailability {
  BLANK,
  INVALID,
  CHECKING,
  FAILED,
  TAKEN,
  AVAILABLE,
}

interface PropsT {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  oldValue?: string;
}

export default memo(({
  placeholder = '',
  value,
  onChange,
  oldValue,
}: PropsT) => {
  const [slugAvailability, setSlugAvailability] = useState(SlugAvailability.BLANK);
  const checkSlugNonce = useNonce();
  const checkSlug = useCallback(async (current: string) => {
    const nonce = checkSlugNonce.next();

    if (current === '') {
      setSlugAvailability(SlugAvailability.BLANK);
      return;
    }
    if (current === oldValue) {
      setSlugAvailability(SlugAvailability.AVAILABLE);
      return;
    }
    if (!VALID_SLUG.test(current) || current.length > MAX_SLUG_LENGTH) {
      setSlugAvailability(SlugAvailability.INVALID);
      return;
    }

    setSlugAvailability(SlugAvailability.CHECKING);
    try {
      const available = await slugTracker.isAvailable(current);
      if (!checkSlugNonce.check(nonce)) {
        return;
      }
      if (available) {
        setSlugAvailability(SlugAvailability.AVAILABLE);
      } else {
        setSlugAvailability(SlugAvailability.TAKEN);
      }
    } catch (err) {
      setSlugAvailability(SlugAvailability.FAILED);
    }
  }, [checkSlugNonce, slugTracker, setSlugAvailability, oldValue]);

  const active = value || placeholder;

  useEffect(() => {
    checkSlug(active);
  }, [active, checkSlug]);

  const retrosBaseUrl = `${document.location.host}/retros/`;

  let slugChecker;
  switch (slugAvailability) {
    case SlugAvailability.INVALID:
      slugChecker = (<div className="slug-checker invalid">Invalid <Cross /></div>);
      break;
    case SlugAvailability.CHECKING:
      slugChecker = (<div className="slug-checker checking" />);
      break;
    case SlugAvailability.FAILED:
      slugChecker = (<div className="slug-checker failed">Unable to check availability</div>);
      break;
    case SlugAvailability.TAKEN:
      slugChecker = (<div className="slug-checker taken">Taken <Cross /></div>);
      break;
    case SlugAvailability.AVAILABLE:
      slugChecker = (<div className="slug-checker available">Available <TickBold /></div>);
      break;
    default:
      slugChecker = null;
      break;
  }

  return (
    <div className="prefixed-input">
      <span className="prefix">{ retrosBaseUrl }</span>
      <Input
        name="slug"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        pattern={VALID_SLUG_PATTERN}
        maxLength={MAX_SLUG_LENGTH}
        required={placeholder === ''}
      />
      { slugChecker }
    </div>
  );
});
