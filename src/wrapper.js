import React, { Component, createElement } from 'react';
import { connect } from 'react-redux';
import storeShape from 'react-redux/lib/utils/storeShape';
import wrapComponent from 'wrap-component';
import { mapStore } from 'multi-provider';
import counter from './counter';

import {
  setState,
  setInitialState,
  replaceState,
  clearState,
} from './action-creators';

export const keys = counter();

const identity = val => val;

export default function ephemeral({
  mapActions = identity,
  mapState = identity,
  initialState = {},
} = {}) {
  return wrapComponent(Wrapped => {
    function retrieveStateFromStore(storeState, key) {
      return storeState[key];
    }

    function createConnect(key) {
      const mapStateToProps = storeState => {
        let state = retrieveStateFromStore(storeState, key);
        if (state === undefined) {
          state = initialState;
        }
        return mapState({ state });
      };

      const mapDispacthToProps = dispatch => {
        return mapActions({
          setState: value => dispatch(setState(key, value)),
          replaceState: value => dispatch(replaceState(key, value)),
        });
      };

      return connect( mapStateToProps, mapDispacthToProps );
    }

    class Ephemeral extends Component {
      constructor(props, context) {
        super(props, context);

        this.key = keys.next();
        this.store = context.store;

        this.store.dispatch(setInitialState(this.key, initialState));

        this.Wrapped = createConnect(this.key)(Wrapped);
      }

      componentWillUnmount() {
        this.store.dispatch(clearState(this.key));
      }

      render() {
        return <this.Wrapped {...this.props} />;
      }
    }
    Ephemeral.contextTypes = { store: storeShape };
    Ephemeral.propTypes = { store: storeShape };

    return  mapStore('ephemeral')(Ephemeral);
  });
}
