import {
  unliftAction,
  liftAction,
  lift,
} from 'redux-lift';

import { SET_STATE, SET_INITIAL_STATE, CHILD } from './action-types';

function liftState(child, ephemeral = {}) {
  return [ child, ephemeral ];
}

function unliftState([ child ]) {
  return child;
}

function getState([ , ephemeral ]) {
  return ephemeral;
}

function liftReducer(reducer) {
  return (state, action) => {
    switch (action.type) {
    case CHILD:
      return liftState(
        reducer(unliftState(state), unliftAction(action)),
        getState(state)
      );
    case SET_STATE:
    case SET_INITIAL_STATE:
      return liftState(
        unliftState(state),
        { ...getState(state), ...action.payload }
      );
    default:
      return state;
    }
  };
}

function liftDispatch(dispatch) {
  return (action) => {
    return dispatch(liftAction(CHILD, action));
  };
}

export default lift({
  liftReducer,
  liftState,
  unliftState,
  liftDispatch,
});
