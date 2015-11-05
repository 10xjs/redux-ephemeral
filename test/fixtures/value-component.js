import { Component, createElement, PropTypes } from 'react';

export default class ValueComponent extends Component {
  render() {
    return <span>{this.props.state.value}</span>;
  }
}

ValueComponent.propTypes = {
  state: PropTypes.shape({
    value: PropTypes.string.isRequired,
  }),
};
