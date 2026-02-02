import type { FunctionComponent } from 'react';
import { getRetroFormatDetails } from './formats';

interface PropsT {
  format: string;
}

export const RetroFormatIcon: FunctionComponent<PropsT> = ({ format }) => {
  const formatDetails = getRetroFormatDetails(format);
  const IconClass = formatDetails.icon;
  const label = `Retro type: ${formatDetails.label}`;

  return (
    <IconClass
      className="retro-format-icon"
      role="img"
      aria-label={label}
      title={label}
    />
  );
};
