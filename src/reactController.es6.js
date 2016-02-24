import React from 'react';
import Controller from './controller';
import isEqual from 'lodash/function/isEqual';

import WrappedPromise from './wrappedPromise';
import WrappedPage from './wrappedPage';

// A reactController is also a React component.
// Define a `render` function at minimum. In this case, we want to
export default class ReactController extends Controller {
  static wrap (promise) {
    return new WrappedPromise(promise);
  }

  constructor (props) {
    super(props);

    this.props = props;

    this.state = {
      data: {},
      meta: {},
      loaded: !!props.dataCache,
      finished: false,
      canceled: false,
    };

    if (props.dataCache) {
      let k;
      for (k in props.dataCache) {
        props.data.set(k, Promise.resolve(props.dataCache[k]));

        if (props.dataCache[k] && props.dataCache[k].body) {
          this.state.data[k] = props.dataCache[k].body;
          this.state.meta[k] = props.dataCache[k].headers;

          if (this.state.meta[k].tracking && this.track === k) {
            this.fireTrackingPixel(this.state.meta[k].tracking);
          }
        } else {
          this.state.data[k] = props.dataCache[k];
        }
      }
    }

    this.watchProperties();
  }

  watchProperties() {
    // Handle no-data error-page case
    if (this.props.data) {
      let key;
      for (key of this.props.data.keys()) {
        if (!this.props.dataCache[key]) {
          this.watch(key);
        }
      }

      if (isEqual([...this.props.data.keys()].sort(), Object.keys(this.props.dataCache).sort())) {
        this.finish();
      }
    }
  }

  watch (property) {
    this.props.data.get(property).then((p) => {
      let data;

      data = Object.assign({}, this.state.data);
      const meta = Object.assign({}, this.state.meta);

      data[property] = p.body;
      meta[property] = p.headers;

      if (p.headers.tracking && this.track === property) {
        this.fireTrackingPixel(p.headers.tracking);
      }

      this.setState({
        data,
        meta,
      });

      if (this.dataValidators(data, this.props.ctx) === false) {
        this.setState({ canceled: true });
        return;
      }

      if (isEqual([...this.props.data.keys()].sort(), Object.keys(this.state.data).sort())) {
        this.finish();
      }
    }, (e) => {
      this.props.app.error(e, this.props.ctx, this.props.app);
      this.props.app.forceRender(this.props.ctx.body, this.props);
    });
  }

  finish () {
    if (this.state.finished === false && this.track) {
      this.props.app.emit('pageview', { ...this.props, data: this.state.data });
      this.setState({ finished: true });
    }
  }
  // Use `render` to return the contents of `this.page`. In this example, we're
  // going to use horse-react to render React, so we'll just return a React
  // element. `render` async.
  render () {
    const Page = this.page;
    const props = this.props;

    if (props.includeLayout && this.layout) {
      const Layout = this.layout;

      return (
        <WrappedPage app={ props.app } api={ props.api } ctx={ props.ctx }>
          <Layout {...props} key='layout'>
            <Page {...props} />
          </Layout>
        </WrappedPage>
      );
    }

    return (
      <Page key={ props.key } />
    );
  }

  layout = null;
  page = null;
}
