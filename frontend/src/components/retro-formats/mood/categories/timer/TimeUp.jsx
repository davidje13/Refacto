import React from 'react';
import PropTypes from 'prop-types';
import forbidExtraProps from '../../../../../helpers/forbidExtraProps';

export class TimeUp extends React.PureComponent {
  static propTypes = {
    onAddExtraTime: PropTypes.func,
  };

  static defaultProps = {
    onAddExtraTime: null,
  };

  handleAddExtraTime = () => {
    const { onAddExtraTime } = this.props;

    onAddExtraTime(2 * 60 * 1000 + 999);
  };

  render() {
    const { onAddExtraTime } = this.props;

    return (
      <React.Fragment>
        <p className="timeup">Time&rsquo;s up!</p>
        { onAddExtraTime && (
          <button type="button" onClick={this.handleAddExtraTime}>+2 more minutes</button>
        ) }
      </React.Fragment>
    );
  }
}

forbidExtraProps(TimeUp);

export default TimeUp;
