import { SET_STATE, SET_INITIAL_STATE } from './action-types';

export function setState(key, value) {
  return {
    type: SET_STATE,
    payload: { [key]: value },
  };
}

export function setInitialState(key, value) {
  return {
    type: SET_INITIAL_STATE,
    payload: { [key]: value },
  };
}
