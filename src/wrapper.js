import React, { Component, createElement } from 'react';
import { connect } from 'react-redux';
import storeShape from 'react-redux/lib/utils/storeShape';
import wrapComponent from 'wrap-component';
import {
  setState,
  setInitialState,
  replaceState,
  clearState,
} from './action-creators';
import counter from './counter';

export const keys = counter();

const identity = val => val;

export default function ephemeral({
  mapActions = identity,
  mapState = identity,
  initialState = {},
} = {}) {
  return wrapComponent(Wrapped => {
    function retrieveStateFromStore(storeState, key) {
      return storeState[1][key];
    }

    function createConnectedComponent(key) {
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

      return connect(
        mapStateToProps,
        mapDispacthToProps
      )(Wrapped);
    }

    class Ephemeral extends Component {
      constructor(props, context) {
        super(props, context);

        this.key = keys.next();
        this.store = context.store;

        this.store.dispatch(setInitialState(this.key, initialState));

        this.ConnectedComponent = createConnectedComponent(this.key);
      }

      componentWillUnmount() {
        this.store.dispatch(clearState(this.key));
      }

      render() {
        return <this.ConnectedComponent {...this.props} />;
      }
    }
    Ephemeral.contextTypes = { store: storeShape };
    Ephemeral.propTypes = { store: storeShape };

    return Ephemeral;
  });
}
