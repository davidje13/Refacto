import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import Input from '../common/Input';
import useNonce from '../../hooks/useNonce';
import { slugTracker } from '../../api/api';
import forbidExtraProps from '../../helpers/forbidExtraProps';

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
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  oldValue?: string;
}

const SlugEntry = ({
  placeholder,
  value,
  onChange,
  oldValue,
}: PropsT): React.ReactElement => {
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
      slugChecker = (
        <div className="slug-checker invalid">
          { 'Invalid \u2715' }
        </div>
      );
      break;
    case SlugAvailability.CHECKING:
      slugChecker = (
        <div className="slug-checker checking" />
      );
      break;
    case SlugAvailability.FAILED:
      slugChecker = (
        <div className="slug-checker failed">
          { 'Unable to check availability' }
        </div>
      );
      break;
    case SlugAvailability.TAKEN:
      slugChecker = (
        <div className="slug-checker taken">
          { 'Taken \u2715' }
        </div>
      );
      break;
    case SlugAvailability.AVAILABLE:
      slugChecker = (
        <div className="slug-checker available">
          { 'Available \u2713' }
        </div>
      );
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
      <div className="slug-checker">
        { slugChecker }
      </div>
    </div>
  );
};

SlugEntry.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  oldValue: PropTypes.string,
};

SlugEntry.defaultProps = {
  placeholder: '',
  oldValue: undefined,
};

forbidExtraProps(SlugEntry);

export default React.memo(SlugEntry);