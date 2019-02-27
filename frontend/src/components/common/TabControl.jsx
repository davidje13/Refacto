import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import './TabControl.less';

export class TabControl extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = { activeKey: null };
  }

  setTab = (e) => {
    e.preventDefault();
    this.setState({ activeKey: e.target.dataset.key });
  };

  getActive() {
    const { tabs } = this.props;
    const { activeKey } = this.state;

    const selected = tabs.filter(({ key }) => (key === activeKey))[0];
    if (selected) {
      return selected;
    }

    return tabs[0];
  }

  render() {
    const { tabs } = this.props;
    const active = this.getActive();

    const tabHeaders = tabs.map(({ key, title, className }) => (
      <li key={key}>
        <button
          type="button"
          onClick={this.setTab}
          data-key={key}
          className={classNames('tab-item', className, { active: (key === active.key) })}
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
  }
}

TabControl.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    className: PropTypes.string,
    content: PropTypes.element.isRequired,
  })).isRequired,
};

forbidExtraProps(TabControl);

export default TabControl;
