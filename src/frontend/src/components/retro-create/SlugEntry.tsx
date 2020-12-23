import React, { memo } from 'react';
import useAwaited from 'react-hook-awaited';
import Input from '../common/Input';
import { slugTracker } from '../../api/api';
import { ReactComponent as TickBold } from '../../../resources/tick-bold.svg';
import { ReactComponent as Cross } from '../../../resources/cross.svg';

export const MAX_SLUG_LENGTH = 64;
const VALID_SLUG_PATTERN = '^[a-z0-9][a-z0-9_-]*$';
const VALID_SLUG = new RegExp(VALID_SLUG_PATTERN);

enum SlugAvailability {
  BLANK,
  INVALID,
  TAKEN,
  AVAILABLE,
}

interface PropsT {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  oldValue?: string;
}

const availabilityJsx: Record<SlugAvailability, React.ReactNode> = {
  [SlugAvailability.BLANK]: null,
  [SlugAvailability.INVALID]: (<div className="slug-checker invalid">Invalid <Cross /></div>),
  [SlugAvailability.TAKEN]: (<div className="slug-checker taken">Taken <Cross /></div>),
  [SlugAvailability.AVAILABLE]: (<div className="slug-checker available">Available <TickBold /></div>),
};

export default memo(({
  placeholder = '',
  value,
  onChange,
  oldValue,
}: PropsT) => {
  const active = value || placeholder;
  const slugAvailability = useAwaited<SlugAvailability>(async () => {
    if (active === '') {
      return SlugAvailability.BLANK;
    }
    if (active === oldValue) {
      return SlugAvailability.AVAILABLE;
    }
    if (!VALID_SLUG.test(active) || active.length > MAX_SLUG_LENGTH) {
      return SlugAvailability.INVALID;
    }
    if (!await slugTracker.isAvailable(active)) {
      return SlugAvailability.TAKEN;
    }
    return SlugAvailability.AVAILABLE;
  }, [active, slugTracker, oldValue]);

  const retrosBaseUrl = `${document.location.host}/retros/`;

  let slugChecker: React.ReactNode;
  switch (slugAvailability.state) {
    case 'pending':
      slugChecker = (<div className="slug-checker checking" />);
      break;
    case 'rejected':
      slugChecker = (<div className="slug-checker failed">Unable to check availability</div>);
      break;
    case 'resolved':
      slugChecker = availabilityJsx[slugAvailability.data];
      break;
    // no default
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
