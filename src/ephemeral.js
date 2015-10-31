import React, { Component, createElement } from 'react';
import isString from 'lodash.isstring';
import { connect } from 'react-redux';
import storeShape from 'react-redux/lib/utils/storeShape';
import wrapComponent from 'wrap-component';
import connectContext from 'connect-context';
import { setState, setInitialState } from './action-creators';

function defaultMapState(state) {
  return { state };
}

function defaultMapSetState(setState) {
  return { setState };
}

function defaultKey(node) {
  // TODO: Compute an id based on the node's moint point in the dom tree.
}

export default function ephemeral({
  mapSetState = defaultMapSetState,
  mapState = defaultMapState,
  key = defaultKey,
  initialState,
  context = 'ephemeral'
} = {}) {
  return wrapComponent(Wrapped => {
    function retrieveEphemeralState(state, key) {
      return state[1][key];
    }

    function computeKey(component) {
      return isString(key) ? key : key(component);
    }

    function createConnectedComponent(key) {
      const mapStateToProps = state => {
        let ephemeralState;

        if (initialState !== undefined) {
          ephemeralState = initialState;
        } else {
          ephemeralState = retrieveEphemeralState(state, key);
        }
        return mapState(ephemeralState);
      };

      const mapDispacthToProps = dispatch => {
        return mapSetState(
          value => dispatch(setState(key, value))
        );
      }

      return connect(
        mapStateToProps,
        mapDispacthToProps
      )(Wrapped);
    }

    class Ephemeral extends Component {
      constructor(props, context) {
        super(props, context);

        this.key = computeKey(this);

        if (initialState !== undefined) {
          context.store.dispatch(
            setInitialState(this.key, initialState)
          );
        }

        this.store = context.store;
        this.ConnectedComponent = createConnectedComponent(this.key);
      }

      render() {
        return <this.ConnectedComponent {...this.props} />;
      }
    }

    Ephemeral.contextTypes = { store: storeShape };
    Ephemeral.propTypes = { store: storeShape };

    return connectContext(context)(Ephemeral);
  });
}
