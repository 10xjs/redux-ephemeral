import {
  unliftAction,
  unliftReducer,
  lift as liftStore,
} from 'redux-lift';

import { SET_EPHEMERAL_STATE } from './action-types';

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
    case SET_EPHEMERAL_STATE:
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
