import { Component, createElement } from 'react';
import isString from 'lodash.isstring';
import { connect } from 'react-redux';
import storeShape from 'react-redux/src/utils/storeShape';
import wrapComponent from 'wrap-component';
import {
  unliftAction,
  unliftReducer,
  lift as liftStore,
} from 'redux-lift';

const identity = val => val;

const actionTypes = {
  SET_EPHEMERAL_STATE: 'SET_EPHEMERAL_STATE',
};

function defaultComputeKey(node) {
  // TODO: Compute an id based on the node's moint point in the dom tree.
}

function setEphemeralState(key, value) {
  return {
    type: actionTypes.SET_EPHEMERAL_STATE,
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

function liftState(child, ephemeral = {}) {
  return {
    child,
    ephemeral,
  };
}

function unliftState({ child }) {
  return child;
}

function getState({ ephemeral }) {
  return ephemeral;
}

function liftReducer(reducer) {
  const unlifted = unliftReducer(reducer, {
    unliftState,
    unliftAction,
  });

  return (state, action) => {
    switch (action.type) {
    case actionTypes.SET_EPHEMERAL_STATE:
      return liftState(
        unliftState(state),
        { ...getState(state), action.payload }
      );
    case 'CHILD':
      return liftState(
        unlifted(state, action),
        getState(state)
      );
    default:
      return state;
    }
  };
}

export const lift = liftStore({
  liftReducer,
  liftState,
  unliftState,
});
