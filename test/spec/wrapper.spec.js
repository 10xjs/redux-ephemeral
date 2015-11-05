/* eslint-env node, mocha */

import { createStore } from 'redux';
import { expect } from 'chai';
import { createElement } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { Provider } from 'multi-provider';

import { enhancer, ephemeral } from '../../src';
import { keys } from '../../src/wrapper';

import BasicComponent from '../fixtures/basic-component';
import ValueComponent from '../fixtures/value-component';
import window from '../fixtures/dom';

Object.assign(global, window);

// Simple reducer.
function app(state) {
  return state;
}

const store = enhancer(createStore)(app);

describe('The ephemeral wrapper', () => {
  it('should preserve the behaviour of the original component', () => {
    const Wrapped = ephemeral()(BasicComponent);
    const rendered = renderToStaticMarkup(
      <Provider store={store.parent}>
        <BasicComponent/>
      </Provider>
    );
    const renderedWrapped = renderToStaticMarkup(
      <Provider stores={{ ephemeral: store, default: store.parent }}>
        <Wrapped/>
      </Provider>
    );
    expect(renderedWrapped).to.equal(rendered);
  });

  it('should remove the state from the store on component unmount', () => {
    const initialState = { hand: 'banana' };
    const Wrapped = ephemeral({ initialState })(BasicComponent);
    const div = global.document.createElement('div');
    render(
      (
        <Provider stores={{ ephemeral: store, default: store.parent }}>
          <Wrapped/>
        </Provider>
      ),
      div
    );
    expect(store.getState()[1][keys.last()]).to.deep.equal(initialState);
    unmountComponentAtNode(div);
    expect(store.getState()[1][keys.last()]).to.be.undefined;
  });

  describe('initial state', () => {
    it('should get set on component mount', () => {
      const initialState = { value: 'component value' };
      const Wrapped = ephemeral({ initialState })(BasicComponent);
      renderToStaticMarkup(
        <Provider stores={{ ephemeral: store, default: store.parent }}>
          <Wrapped/>
        </Provider>
      );
      expect(store.getState()[1][keys.last()]).to.deep.equal(initialState);
    });

    it('should be avaialble to initial render', () => {
      const initialState = { value: 'component value' };
      const Wrapped = ephemeral({ initialState })(ValueComponent);
      const rendered = renderToStaticMarkup(
        <Provider store={store.parent}>
          <ValueComponent state={initialState}/>
        </Provider>
      );
      const renderedWrapped = renderToStaticMarkup(
        <Provider stores={{ ephemeral: store, default: store.parent }}>
          <Wrapped/>
        </Provider>
      );
      expect(renderedWrapped).to.equal(rendered);
    });
  });

  describe('props', () => {
    it('should be set', () => {
      const StaticComponent = props => {
        expect(props).to.include.keys(
          'setState',
          'replaceState',
          'state'
        );
        return <span/>;
      };
      const Wrapped = ephemeral()(StaticComponent);
      renderToStaticMarkup(
        <Provider stores={{ ephemeral: store, default: store.parent }}>
          <Wrapped/>
        </Provider>
      );
    });
  });

  describe('`mapState()`', () => {
    it('should recieve `{ state }`', () => {
      const Wrapped = ephemeral({
        mapState(params) {
          expect(params).to.have.key('state');
          return params;
        },
      })(BasicComponent);
      renderToStaticMarkup(
        <Provider stores={{ ephemeral: store, default: store.parent }}>
          <Wrapped/>
        </Provider>
      );
    });

    it('should get merged with props', () => {
      const StaticComponent = props => {
        expect(props).to.include.keys(
          'custom1',
          'custom2'
        );
        return <span/>;
      };
      const Wrapped = ephemeral({
        mapState() {
          return {
            custom1: 1,
            custom2: 2,
          };
        },
      })(StaticComponent);
      renderToStaticMarkup(
        <Provider stores={{ ephemeral: store, default: store.parent }}>
          <Wrapped/>
        </Provider>
      );
    });
  });

  describe('`mapActions()`', () => {
    it('should recieve `{ setState, replaceState }`', () => {
      const Wrapped = ephemeral({
        mapActions(params) {
          expect(params).to.have.keys('setState', 'replaceState');
          return params;
        },
      })(BasicComponent);
      renderToStaticMarkup(
        <Provider stores={{ ephemeral: store, default: store.parent }}>
          <Wrapped/>
        </Provider>
      );
    });

    it('should get merged with props', () => {
      const StaticComponent = props => {
        expect(props).to.include.keys(
          'custom1',
          'custom2'
        );
        return <span/>;
      };
      const Wrapped = ephemeral({
        mapActions() {
          return {
            custom1: 1,
            custom2: 2,
          };
        },
      })(StaticComponent);
      renderToStaticMarkup(
        <Provider stores={{ ephemeral: store, default: store.parent }}>
          <Wrapped/>
        </Provider>
      );
    });
  });
});
