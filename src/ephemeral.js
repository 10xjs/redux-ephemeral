import { Component, createElement } from 'react';
import isString from 'lodash.isstring';
import { connect } from 'react-redux';
import storeShape from 'react-redux/lib/utils/storeShape';
import wrapComponent from 'wrap-component';

import { SET_EPHEMERAL_STATE } from './action-types';

const identity = val => val;

function defaultComputeKey(node) {
  // TODO: Compute an id based on the node's moint point in the dom tree.
}

function setEphemeralState(key, value) {
  return {
    type: SET_EPHEMERAL_STATE,
    payload: { [key]: value },
  };
}

export function ephemeral(
  mapSetState = identity,
  mapValue = identity,
  computeKey = defaultComputeKey
) {
  return wrapComponent(Wrapped => {
    function retrieveEphemeralValue(state, key) {
      return state[key];
    }

    function getComputedKey(component) {
      return isString(computeKey) ? computeKey : computeKey(component);
    }

    class Ephemeral extends Component {
      constructor(props, context) {
        super(props, context);

        const key = getComputedKey(this);

        const mapStateToProps = state => mapValue(
          retrieveEphemeralValue(state, key)
        );

        const mapDispacthToProps = dispatch => mapSetState(
          value => dispatch(setEphemeralState(key, value))
        );

        this.ConnectedComponent = connect(
          mapStateToProps,
          mapDispacthToProps
        )(Wrapped);
      }

      render(props) {
        return <this.ConnectedComponent {...props} />;
      }
    }

    Ephemeral.contextTypes = { store: storeShape };
    Ephemeral.propTypes = { store: storeShape };

    return Ephemeral;
  });
}
