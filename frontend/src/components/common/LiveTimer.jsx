import React from 'react';
import PropTypes from 'prop-types';

function delayUntilNext(now, target, step) {
  return Math.max(0, (target - now) % step);
}

function setSmallTimeout(fn, delay) {
  if (delay < 10) {
    return requestAnimationFrame(fn);
  }
  return setTimeout(fn, delay);
}

function clearSmallTimeout(id) {
  clearTimeout(id);
  cancelAnimationFrame(id);
}

export class LiveTimer extends React.Component {
  static propTypes = {
    targetTime: PropTypes.number.isRequired,
    Counter: PropTypes.elementType.isRequired,
    Expired: PropTypes.elementType,
    getTime: PropTypes.func,
    refreshInterval: PropTypes.number,
  };

  static defaultProps = {
    Expired: null,
    getTime: Date.now,
    refreshInterval: 50,
  };

  constructor(props) {
    super(props);

    this.state = { renderFrame: 0 };
    this.lastRenderTime = 1;
    this.timeout = null;
  }

  componentDidMount() {
    const { targetTime, refreshInterval } = this.props;

    if (this.lastRenderTime < targetTime && this.timeout === null) {
      const delay = delayUntilNext(this.lastRenderTime, targetTime, refreshInterval);
      this.timeout = setSmallTimeout(this.step, delay);
    }
  }

  componentDidUpdate() {
    this.componentDidMount();
  }

  componentWillUnmount() {
    clearSmallTimeout(this.timeout);
    this.timeout = null;
  }

  step = () => {
    this.timeout = null;

    const { renderFrame } = this.state;
    this.setState({ renderFrame: renderFrame + 1 });
  };

  render() {
    const {
      Counter,
      Expired,
      getTime,
      targetTime,
      refreshInterval,
      ...props
    } = this.props;

    const now = getTime();
    this.lastRenderTime = now;

    if (now >= targetTime && Expired) {
      return (<Expired {...props} />);
    }

    return (<Counter remaining={targetTime - now} {...props} />);
  }
}

export default LiveTimer;
