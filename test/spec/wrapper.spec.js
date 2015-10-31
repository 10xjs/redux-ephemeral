/* global describe, it */

import { createStore } from 'redux';
import { expect } from 'chai';
import React, { Component, createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server'
import { Provider } from 'react-redux';

import { enhancer, ephemeral } from '../../src';
import { setState } from '../../src/action-creators';

// Simple reducer.
function app(state) {
  return state;
}

describe('The ephemeral wrapper', () => {

  it('should preserve the behaviour of the original component', () => {
    class Thing extends Component {
      render() {
        return <span>cheezy potatos</span>;
      }
    }

    const store = enhancer(createStore)(app);
    const WrappedThing = ephemeral()(Thing);

    const renderedThing = renderToStaticMarkup(
      <Provider store={store.parent}>
        <Thing/>
      </Provider>
    );
    const renderedWrappedThing = renderToStaticMarkup(
      <Provider store={store}>
        <WrappedThing/>
      </Provider>
    );

    expect(renderedWrappedThing).to.equal(renderedThing);
  });

  it('should render the state from the store', () => {
    const key = 'input';
    const state = 'text';

    class Thing extends Component {
      render() {
        return <span>{this.props.state}</span>;
      }
    }

    const renderedThing = `<span>${state}</span>`;

    const store = enhancer(createStore)(app);
    const WrappedThing = ephemeral({ key })(Thing);

    store.dispatch(setState(key, state));


    const renderedWrappedThing = renderToStaticMarkup(
      <Provider store={store}>
        <WrappedThing/>
      </Provider>
    );

    expect(renderedWrappedThing).to.equal(renderedThing);
  });

  it('should set an initial state via `initialState`', () => {
    class Thing extends Component {
      render() {
        return <span />;
      }
    }

    const key = 'freeman';
    const initialState = 'half-life 3';

    const store = enhancer(createStore)(app);
    const WrappedThing = ephemeral({ initialState, key })(Thing);

    renderToStaticMarkup(
      <Provider store={store}>
        <WrappedThing/>
      </Provider>
    );

    expect(store.getState()[1][key]).to.equal(initialState);
  });

  it('should render an initial state via `initialState`', () => {
    class Thing extends Component {
      render() {
        return <span>{this.props.state}</span>;
      }
    }

    const key = 'meta';
    const initialState = 'lab';

    const renderedThing = `<span>${initialState}</span>`;

    const store = enhancer(createStore)(app);
    const WrappedThing = ephemeral({ initialState, key})(Thing);

    const renderedWrappedThing = renderToStaticMarkup(
      <Provider store={store}>
        <WrappedThing/>
      </Provider>
    );

    expect(renderedWrappedThing).to.equal(renderedThing);
  });

  it('should update the store with `setState`', () => {
    const key = 'hand';
    const state = 'banana';

    class Thing extends Component {
      componentWillMount() {
        this.props.setState(state);
      }

      render() {
        return <span />;
      }
    }

    const store = enhancer(createStore)(app);
    const WrappedThing = ephemeral({ key })(Thing);

    renderToStaticMarkup(
      <Provider store={store}>
        <WrappedThing/>
      </Provider>
    );

    expect(store.getState()[1][key]).to.equal(state);
  });

});
