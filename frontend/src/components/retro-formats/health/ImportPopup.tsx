import { useEffect, useState, type FunctionComponent } from 'react';
import type { RetroHistoryItem } from '../../../shared/api-entities';
import type { Counts, HealthSummary } from '../../../shared/health';
import { useSubmissionCallback } from '../../../hooks/useSubmissionCallback';
import { useLocalDateProvider } from '../../../hooks/env/useLocalDateProvider';
import type { HealthQuestion } from '../../../actions/healthRetro';
import { formatDate } from '../../../time/formatters';
import { realAutoFocus } from '../../../helpers/realAutoFocus';
import { Popup } from '../../common/Popup';
import { Alert } from '../../common/Alert';
import { ALL_ANSWERS } from './answers';
import './ImportPopup.css';

interface PropsT {
  isOpen: boolean;
  onImport: (summary: HealthSummary) => void;
  onClose: () => void;
  questions: HealthQuestion[];
  retroHistory: RetroHistoryItem[];
}

export const ImportPopup: FunctionComponent<PropsT> = ({
  isOpen,
  onImport,
  onClose,
  questions,
  retroHistory,
}) => {
  const localDateProvider = useLocalDateProvider();
  const [date, setDate] = useState('');
  const [values, setValues] = useState(new Map<string, string>());
  const [performImport, sending, error, resetError] = useSubmissionCallback(
    () => {
      const time = Date.parse(`${date}T00:00:00Z`);
      if (
        Number.isNaN(time) ||
        time > Date.now() ||
        time < Date.now() - 1000 * 60 * 60 * 24 * 365 * 50
      ) {
        throw new Error('Invalid date');
      }
      if (retroHistory.some((o) => o.time === time)) {
        throw new Error(`Already added results for ${formatDate(time)}`);
      }
      onImport({
        time,
        format: 'health',
        data: {
          questions: questions.map((q) => ({
            id: q.id,
            counts: Object.fromEntries(
              ALL_ANSWERS.map((a) => {
                const raw = values.get(`${q.id}:${a.id}`) || '0';
                if (!/^[0-9]+$/.test(raw)) {
                  throw new Error('Invalid value');
                }
                return [a.id, Number.parseInt(raw, 10)];
              }),
            ) as Counts,
          })),
          imported: true,
        },
      });
      onClose();
    },
  );

  useEffect(() => {
    if (isOpen) {
      setDate('');
      setValues(new Map<string, string>());
      resetError();
    }
  }, [isOpen]);

  return (
    <Popup
      title="Import Past Results"
      keys={{ Enter: performImport, Escape: onClose }}
      isOpen={isOpen}
      onClose={onClose}
    >
      <form className="global-form health-import" onSubmit={performImport}>
        <p>
          If you have previously run a health check outside Refacto, you can
          import your results here so that you can see trends. If you used
          different questions, the trends may not be reliable (note that you can
          change the quesions in Settings).
        </p>
        <label>
          Date of results
          <input
            ref={realAutoFocus}
            type="date"
            value={date}
            max={
              new Date(localDateProvider.getMidnightTimestamp())
                .toISOString()
                .split('T')[0]
            }
            onChange={(e) => setDate(e.currentTarget.value)}
            autoComplete="off"
            required
          />
        </label>
        <table className="data">
          <thead>
            <tr>
              <th className="topic">Topic</th>
              {ALL_ANSWERS.map((a) => (
                <th key={a.id} className="votes">
                  {a.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id}>
                <td>{q.title}</td>
                {ALL_ANSWERS.map((a) => (
                  <td key={a.id}>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={values.get(`${q.id}:${a.id}`) ?? ''}
                      onChange={(e) =>
                        setValues(
                          new Map([
                            ...values,
                            [`${q.id}:${a.id}`, e.currentTarget.value],
                          ]),
                        )
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <section className="dialog-options">
          <button type="button" className="global-button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="global-button primary"
            disabled={sending}
          >
            Import
          </button>
          <Alert message={error} />
        </section>
      </form>
    </Popup>
  );
};
