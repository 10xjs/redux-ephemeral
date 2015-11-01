import {
  SET_INITIAL_STATE,
  SET_STATE,
  REPLACE_STATE,
  CLEAR_STATE,
 } from './action-types';

export function setInitialState(key, state = {}) {
  return {
    type: SET_INITIAL_STATE,
    payload: { [key]: state },
  };
}

export function setState(key, state = {}) {
  return {
    type: SET_STATE,
    payload: [ key, state ],
  };
}

export function replaceState(key, state = {}) {
  return {
    type: REPLACE_STATE,
    payload: { [key]: state },
  };
}

export function clearState(key) {
  return {
    type: CLEAR_STATE,
    payload: key,
  };
}
