/*eslint-env node, mocha */

import { createStore } from 'redux';
import { expect } from 'chai';
import React, { Component, createElement } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import jsdom from 'jsdom';
import { Provider } from 'react-redux';

import { enhancer, ephemeral } from '../../src';
import { keys } from '../../src/ephemeral';

// Setup the simplest document possible.
const document = jsdom.jsdom('<!doctype html><html><body></body></html>');

// Set the window object out of the document.
const window = document.defaultView;

// Set globals for mocha that make access to document and window feel natural in
// the test environment.
global.document = document;
global.window = window;

// Take all properties of the window object and also attach it to the  mocha
// global object.
Object.assign(global, { document, window }, window);

// Simple reducer.
function app(state) {
  return state;
}

const store = enhancer(createStore)(app);

describe('The ephemeral wrapper', () => {
  it('should preserve the behaviour of the original component', () => {
    class Thing extends Component {
      render() {
        return <span>cheezy potatos</span>;
      }
    }

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

  it('should set an initial state via `initialState`', () => {
    class Thing extends Component {
      render() {
        return <span />;
      }
    }

    const initialState = { vapuor: 'half-life 3' };

    const WrappedThing = ephemeral({ initialState })(Thing);

    renderToStaticMarkup(
      <Provider store={store}>
        <WrappedThing/>
      </Provider>
    );

    expect(store.getState()[1][keys.last()]).to.deep.equal(initialState);
  });

  it('should render an initial state via `initialState`', () => {
    class Thing extends Component {
      render() {
        return <span>{this.props.state.meta}</span>;
      }
    }

    const initialState = { meta: 'lab' };

    const renderedThing = `<span>${initialState.meta}</span>`;

    const WrappedThing = ephemeral({ initialState })(Thing);

    const renderedWrappedThing = renderToStaticMarkup(
      <Provider store={store}>
        <WrappedThing/>
      </Provider>
    );

    expect(renderedWrappedThing).to.equal(renderedThing);
  });

  it('should remove the state from the store on unmount', () => {
    const initialState = { hand: 'banana' };

    class Thing extends Component {

      render() {
        return <span />;
      }
    }

    const WrappedThing = ephemeral({ initialState })(Thing);

    const div = document.createElement('div');

    render(
      (
        <Provider store={store}>
          <WrappedThing/>
        </Provider>
      ),
      div
    );

    expect(store.getState()[1][keys.last()]).to.deep.equal(initialState);
    unmountComponentAtNode(div);
    expect(store.getState()[1][keys.last()]).to.be.undefined;
  });
});
