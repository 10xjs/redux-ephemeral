/* global describe, it */

import { createStore, compose } from 'redux';
import { expect } from 'chai';

import { enhancer } from '../../src';
import {
  setState,
  setInitialState,
  replaceState,
} from '../../src/action-creators';

import { name, normalize } from 'redux-lift';

// Simple reducer.
function app(state, { type, value }) {
  return type === 'UPDATE' ? state + value : state;
}

// Simple reducer.
function app(state) {
  return state;
}

const createNamedStores = compose(
  normalize,
  name('ephemeral')(enhancer)(createStore)
);

describe('The ephemeral enhancer', () => {
  it('should store state using `setInitialState`', () => {
    const stores = createNamedStores(app, 4);
    const state =  { foo: 'bar' };
    stores.ephemeral.dispatch(setInitialState(0, state));
    expect(stores.ephemeral.getState()[1][0]).to.deep.equal(state);
  });

  it('should shallow merge state using `setState`', () => {
    const stores = createNamedStores(app, 4);
    const state1 =  { foo: 'bar', bar: 'foo' };
    const state2 =  { foo: 'foo', ham: 'sandwiches' };
    const mergedState = {
      ...state1,
      ...state2,
    };
    stores.ephemeral.dispatch(setInitialState(0, state1));
    stores.ephemeral.dispatch(setState(0, state2));
    expect(stores.ephemeral.getState()[1][0]).to.deep.equal(mergedState);
  });

  it('should overwrite state using `replaceState`', () => {
    const stores = createNamedStores(app, 4);
    const state1 =  { foo: 'bar' };
    const state2 =  { potato: 'salad' };
    stores.ephemeral.dispatch(setInitialState(0, state1));
    stores.ephemeral.dispatch(replaceState(0, state2));
    expect(stores.ephemeral.getState()[1][0]).to.deep.equal(state2);
  });
});
