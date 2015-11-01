/*eslint-env node, mocha */

import { createStore, compose } from 'redux';
import { expect } from 'chai';
import React, { Component, createElement } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import jsdom from 'jsdom';
import { Provider } from 'multi-provider';

import { enhancer, ephemeral } from '../../src';
import { keys } from '../../src/wrapper';
import { name, normalize } from 'redux-lift';


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

const createNamedStores = compose(
  normalize,
  name('ephemeral')(enhancer)(createStore)
);

const stores = createNamedStores(app);

describe('The ephemeral wrapper', () => {
  it('should preserve the behaviour of the original component', () => {
    class Thing extends Component {
      render() {
        return <span>cheezy potatos</span>;
      }
    }

    const WrappedThing = ephemeral()(Thing);

    const renderedThing = renderToStaticMarkup(
      <Provider stores={stores}>
        <Thing/>
      </Provider>
    );
    const renderedWrappedThing = renderToStaticMarkup(
      <Provider stores={stores}>
        <WrappedThing/>
      </Provider>
    );

    expect(renderedWrappedThing).to.equal(renderedThing);
  });

  it('should remove the state from the store on component unmount', () => {
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
        <Provider stores={stores}>
          <WrappedThing/>
        </Provider>
      ),
      div
    );

    expect(stores.ephemeral.getState()[1][keys.last()]).to.deep.equal(initialState);
    unmountComponentAtNode(div);
    expect(stores.ephemeral.getState()[1][keys.last()]).to.be.undefined;
  });

  describe('initial state', () => {
    it('should get set on component mount', () => {
      class Thing extends Component {
        render() {
          return <span />;
        }
      }

      const initialState = { soon: 'half-life 3' };

      const WrappedThing = ephemeral({ initialState })(Thing);

      renderToStaticMarkup(
        <Provider stores={stores}>
          <WrappedThing/>
        </Provider>
      );

      expect(stores.ephemeral.getState()[1][keys.last()]).to.deep.equal(initialState);
    });

    it('should be avaialble to initial render', () => {
      class Thing extends Component {
        render() {
          return <span>{this.props.state.meta}</span>;
        }
      }

      const initialState = { meta: 'lab' };

      const renderedThing = `<span>${initialState.meta}</span>`;

      const WrappedThing = ephemeral({ initialState })(Thing);

      const renderedWrappedThing = renderToStaticMarkup(
        <Provider stores={stores}>
          <WrappedThing/>
        </Provider>
      );

      expect(renderedWrappedThing).to.equal(renderedThing);
    });
  });

  describe('props', () => {
    it('should be set', () => {
      class Thing extends Component {
        render() {
          expect(this.props).to.include.keys(
            'setState',
            'replaceState',
            'state'
          );
          return <span/>;
        }
      }

      const WrappedThing = ephemeral()(Thing);

      renderToStaticMarkup(
        <Provider stores={stores}>
          <WrappedThing/>
        </Provider>
      );
    });
  });

  describe('`mapState()`', () => {
    it('should recieve `{ state }`', () => {
      class Thing extends Component {
        render() {
          return <span/>;
        }
      }

      const WrappedThing = ephemeral({
        mapState(params) {
          expect(params).to.have.key('state');
          return params;
        },
      })(Thing);

      renderToStaticMarkup(
        <Provider stores={stores}>
          <WrappedThing/>
        </Provider>
      );
    });

    it('should get merged with props', () => {
      class Thing extends Component {
        render() {
          expect(this.props).to.include.keys(
            'custom1',
            'custom2'
          );
          return <span/>;
        }
      }

      const WrappedThing = ephemeral({
        mapState(params) {
          return {
            custom1: 1,
            custom2: 2,
          };
        },
      })(Thing);

      renderToStaticMarkup(
        <Provider stores={stores}>
          <WrappedThing/>
        </Provider>
      );
    });
  });

  describe('`mapActions()`', () => {
    it('should recieve `{ setState, replaceState }`', () => {
      class Thing extends Component {
        render() {
          return <span/>;
        }
      }

      const WrappedThing = ephemeral({
        mapActions(params) {
          expect(params).to.have.keys('setState', 'replaceState');
          return params;
        },
      })(Thing);

      renderToStaticMarkup(
        <Provider stores={stores}>
          <WrappedThing/>
        </Provider>
      );
    });

    it('should get merged with props', () => {
      class Thing extends Component {
        render() {
          expect(this.props).to.include.keys(
            'custom1',
            'custom2'
          );
          return <span/>;
        }
      }

      const WrappedThing = ephemeral({
        mapActions(params) {
          return {
            custom1: 1,
            custom2: 2,
          };
        },
      })(Thing);

      renderToStaticMarkup(
        <Provider stores={stores}>
          <WrappedThing/>
        </Provider>
      );
    });
  });
});

