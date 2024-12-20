import { ReactNode, type FC } from 'react';
import TickBold from '../../../resources/tick-bold.svg';
import Cross from '../../../resources/cross.svg';
import {
  MAX_SLUG_LENGTH,
  SlugAvailability,
  useSlugAvailability,
  VALID_SLUG_PATTERN,
} from '../../hooks/data/useSlugAvailability';
import './SlugEntry.less';

interface PropsT {
  placeholder?: string;
  ariaLabel?: string;
  value: string;
  onChange: (v: string) => void;
  oldValue?: string;
  showAvailability?: boolean;
}

const availabilityJsx: Record<SlugAvailability, ReactNode> = {
  [SlugAvailability.BLANK]: null,
  [SlugAvailability.PENDING]: <div className="slug-checker checking" />,
  [SlugAvailability.FAILED]: (
    <div className="slug-checker failed">Unable to check availability</div>
  ),
  [SlugAvailability.INVALID]: (
    <div className="slug-checker invalid">
      Invalid <Cross />
    </div>
  ),
  [SlugAvailability.TAKEN]: (
    <div className="slug-checker taken">
      Taken <Cross />
    </div>
  ),
  [SlugAvailability.AVAILABLE]: (
    <div className="slug-checker available">
      Available <TickBold />
    </div>
  ),
};

const SlugAvailabilityDisplay = ({
  slug,
  oldValue,
}: {
  slug: string;
  oldValue: string | undefined;
}) => availabilityJsx[useSlugAvailability(slug, oldValue)];

export const SlugEntry: FC<PropsT> = ({
  placeholder = '',
  ariaLabel,
  value,
  onChange,
  oldValue,
  showAvailability = false,
}) => (
  <div className="prefixed-input">
    <span className="prefix">{`${document.location.host}/retros/`}</span>
    <input
      name="slug"
      type="text"
      placeholder={placeholder}
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      pattern={VALID_SLUG_PATTERN}
      maxLength={MAX_SLUG_LENGTH}
      required={placeholder === ''}
      autoComplete="off"
    />
    {showAvailability ? (
      <SlugAvailabilityDisplay
        slug={value || placeholder}
        oldValue={oldValue}
      />
    ) : null}
  </div>
);
