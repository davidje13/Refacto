import { memo, type ReactNode, useId } from 'react';
import { classNames } from '../../helpers/classNames';
import { useStateMap } from '../../hooks/useStateMap';
import './TabControl.css';

export interface TabT {
  key: string;
  title: ReactNode;
  className?: string;
  content: ReactNode;
}

function getActive(tabs: TabT[], activeKey: string): TabT | undefined {
  const selected = tabs.filter(({ key }) => key === activeKey)[0];
  return selected ?? tabs[0];
}

interface PropsT {
  tabs: TabT[];
  emptyState?: ReactNode;
  identifier?: string | undefined;
  initial?: string | undefined;
}

export const TabControl = memo(
  ({ tabs, emptyState, identifier, initial = '' }: PropsT) => {
    const id = useId();
    const [activeKey, setActiveKey] = useStateMap(identifier, initial, true);
    if (!tabs.length) {
      return emptyState;
    }

    const active = getActive(tabs, activeKey);

    const tabHeaders = tabs.map(({ key, title, className }) => (
      <label
        key={key}
        className={classNames('tab-item', className, {
          active: key === active?.key,
        })}
      >
        <input
          type="radio"
          role="tab"
          name={id}
          id={`${id}-${key}`}
          value={key}
          checked={key === active?.key}
          onChange={(e) => {
            if (e.currentTarget.checked) {
              setActiveKey(key);
            }
          }}
        />
        {title}
      </label>
    ));

    return (
      <section className="tab-control">
        <div className="tab-bar" role="tablist">
          {tabHeaders}
        </div>
        <div className="tab-content" role="tabpanel">
          {active?.content}
        </div>
      </section>
    );
  },
);
