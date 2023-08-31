import { useState, useCallback, memo, ReactNode, MouseEvent } from 'react';
import classNames from 'classnames';
import './TabControl.less';

interface TabT {
  key: string;
  title: string;
  className?: string;
  content: ReactNode;
}

function getActive(tabs: TabT[], activeKey: string): TabT | undefined {
  const selected = tabs.filter(({ key }) => key === activeKey)[0];
  return selected ?? tabs[0];
}

interface PropsT {
  tabs: TabT[];
}

export const TabControl = memo(({ tabs }: PropsT) => {
  const [activeKey, setActiveKey] = useState('');
  const active = getActive(tabs, activeKey);

  const handleTabClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      setActiveKey(e.currentTarget.dataset['key'] ?? '');
    },
    [setActiveKey],
  );

  const tabHeaders = tabs.map(({ key, title, className }) => (
    <li key={key}>
      <button
        type="button"
        onClick={handleTabClick}
        data-key={key}
        className={classNames('tab-item', className, {
          active: key === active?.key,
        })}
      >
        {title}
      </button>
    </li>
  ));

  return (
    <section className="tab-control">
      <nav className="tab-bar">
        <ul>{tabHeaders}</ul>
      </nav>
      {active?.content}
    </section>
  );
});
