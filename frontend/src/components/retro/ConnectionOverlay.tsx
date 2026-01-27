import type { FunctionComponent } from 'react';
import TickBold from '../../../resources/tick-bold.svg';
import type { RetroReducerStatus } from '../../hooks/data/useRetroReducer';
import { Popup } from '../common/Popup';
import { PasswordForm } from '../password/PasswordForm';
import './ConnectionOverlay.css';

interface PropsT {
  status: RetroReducerStatus;
  slug?: string;
  retroId?: string;
}

export const ConnectionOverlay: FunctionComponent<PropsT> = ({
  status,
  slug,
  retroId,
}) => {
  switch (status) {
    case 'connected':
      return (
        <div className="connection-overlay connected" aria-hidden>
          <TickBold role="presentation" /> Connected
        </div>
      );
    case 'reconnecting':
      return (
        <div className="connection-overlay disconnected" role="status">
          Reconnecting&hellip;
        </div>
      );
    case 'reauthenticate':
      if (slug && retroId) {
        return (
          <Popup title="Login expired" isOpen onClose={() => null}>
            <div className="popup-password">
              <p>
                Your login has expired or the retro password has been changed.
              </p>
              <p>Please enter the retro password to continue:</p>
              <PasswordForm slug={slug} retroId={retroId} autoFocus />
            </div>
          </Popup>
        );
      }
  }
  return null;
};
