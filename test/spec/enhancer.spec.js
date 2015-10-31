/* global describe, it */

import { createStore } from 'redux';
import { expect } from 'chai';

import { enhancer } from '../../src';
import { setState } from '../../src/action-creators';

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

  it('should store value using `setState` action creator', () => {
    const store = enhancer(createStore)(app, 4);
    store.dispatch(setState('foo', 'bar'));
    expect(store.getState()[1].foo).to.equal('bar');
  });
});
