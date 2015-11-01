/* global describe, it */

import { createStore } from 'redux';
import { expect } from 'chai';

import { enhancer } from '../../src';
import {
  setState,
  setInitialState,
  replaceState,
} from '../../src/action-creators';

// Simple reducer.
function app(state, { type, value }) {
  return type === 'UPDATE' ? state + value : state;
}

describe('The ephemeral enhancer', () => {
  it('should create a store with a parent', () => {
    const store = enhancer(createStore)(app, 1);
    expect(store).to.have.property('parent');
  });

  it('should return parent state', () => {
    const store = enhancer(createStore)(app, 2);
    expect(store.parent.getState()).to.equal(2);
  });

  it('should allow parent store dispatch', () => {
    const store = enhancer(createStore)(app, 3);
    store.parent.dispatch({ type: 'UPDATE', value: 3 });
    expect(store.parent.getState()).to.equal(6);
  });

  it('should store state using `setInitialState`', () => {
    const store = enhancer(createStore)(app, 4);
    const state =  { foo: 'bar' };
    store.dispatch(setInitialState(0, state));
    expect(store.getState()[1][0]).to.deep.equal(state);
  });

  it('should shallow merge state using `setState`', () => {
    const store = enhancer(createStore)(app, 4);
    const state1 =  { foo: 'bar', bar: 'foo' };
    const state2 =  { foo: 'foo', ham: 'sandwiches' };
    const mergedState = {
      ...state1,
      ...state2,
    };
    store.dispatch(setInitialState(0, state1));
    store.dispatch(setState(0, state2));
    expect(store.getState()[1][0]).to.deep.equal(mergedState);
  });

  it('should overwrite state using `replaceState`', () => {
    const store = enhancer(createStore)(app, 4);
    const state1 =  { foo: 'bar' };
    const state2 =  { potato: 'salad' };
    store.dispatch(setInitialState(0, state1));
    store.dispatch(replaceState(0, state2));
    expect(store.getState()[1][0]).to.deep.equal(state2);
  });
});
