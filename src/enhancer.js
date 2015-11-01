import omit from 'lodash.omit';

import {
  unliftAction,
  liftAction,
  lift,
} from 'redux-lift';

import {
  SET_INITIAL_STATE,
  SET_STATE,
  REPLACE_STATE,
  CLEAR_STATE,
  CHILD,
} from './action-types';

function liftState(child, ephemeral = {}) {
  return [ child, ephemeral ];
}

function unliftState([ child ]) {
  return child;
}

export function getState([ , ephemeral ]) {
  return ephemeral;
}

function liftReducer(reducer) {
  return (state, action) => {
    const updateState = (ephemeral) => liftState(unliftState(state), ephemeral);
    switch (action.type) {
    case CHILD:
      return liftState(
        reducer(unliftState(state), unliftAction(action)),
        getState(state)
      );
    case REPLACE_STATE:
    case SET_INITIAL_STATE:
      return updateState({ ...getState(state), ...action.payload });
    case SET_STATE:
      const [ key, value ] = action.payload;
      const currentState = getState(state)[key];
      const nextState = {
        ...currentState,
        ...value,
      };
      return updateState({ ...getState(state), [key]: nextState });
    case CLEAR_STATE:
      return updateState(omit(getState(state), action.payload));
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
