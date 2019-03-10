import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import './TabControl.less';

function getActive(tabs, activeKey) {
  const selected = tabs.filter(({ key }) => (key === activeKey))[0];
  return selected || tabs[0];
}

export const TabControl = ({ tabs }) => {
  const [activeKey, setActiveKey] = useState(null);
  const active = getActive(tabs, activeKey);

  const handleTabClick = useCallback((e) => {
    setActiveKey(e.target.dataset.key);
  }, [setActiveKey]);

  const tabHeaders = tabs.map(({ key, title, className }) => (
    <li key={key}>
      <button
        type="button"
        onClick={handleTabClick}
        data-key={key}
        className={classNames(
          'tab-item',
          className,
          { active: (key === active.key) },
        )}
      >
        {title}
      </button>
    </li>
  ));

  return (
    <section className="tab-control">
      <nav className="tab-bar">
        <ul>{ tabHeaders }</ul>
      </nav>
      { active.content }
    </section>
  );
};

TabControl.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    className: PropTypes.string,
    content: PropTypes.node.isRequired,
  })).isRequired,
};

forbidExtraProps(TabControl);

export default React.memo(TabControl);
