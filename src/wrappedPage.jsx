import React from 'react';
import { isEqual } from 'lodash/lang';
import { omit } from 'lodash/object';

// A reactController is also a React component.
// Define a `render` function at minimum. In this case, we want to
export default class WrappedPage extends React.Component {
  static childContextTypes = {
    ctx: React.PropTypes.object,
  };

  getChildContext () {
    return { ctx: this.props.context };
  }

  constructor (props) {
    super(props);

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
        props.dataPromises.set(k, Promise.resolve(props.dataCache[k]));

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
  }

  watchProperties(data, dataCache) {
    // Handle no-data error-page case
    if (data) {
      data.forEach((val, key) => {
        if (!dataCache[key]) {
          this.watch(key, val);
        }
      });

      if (isEqual([...this.props.dataPromises.keys()].sort(), Object.keys(this.state.data).sort())) {
        this.finish();
      }
    }
  }

  componentDidMount() {
    this.watchProperties(this.props.dataPromises, this.props.dataCache);
  }

  watch (property, promise) {
    promise.then((p) => {
      this.setState({
        data: {
          ...this.state.data,
          [property]: p && p.body ? p.body : p,
        },
        meta: {
          ...this.state.meta,
          [property]: p ? p.headers : {},
        },
      });

      if (isEqual([...this.props.dataPromises.keys()].sort(), Object.keys(this.state.data).sort())) {
        this.finish();
      }
    }, (e) => {
      this.props.context.app.error(e, this.props.context, this.props.context.app);
      this.props.context.app.forceRender(this.props.context.body, this.props);
    });
  }

  finish () {
    if (this.state.finished === false) {
      this.props.context.app.emit('pageview', { ...this.props, data: this.state.data });
      this.setState({ finished: true });
    }
  }

  getPageProps () {
    const { props, state } = this;

    const pageProps = {
      ...props,
      ...state,
    };

    delete pageProps.dataCache;
    delete pageProps.Layout;
    delete pageProps.Page;

    return pageProps;
  }

  // Use `render` to return the contents of `this.page`. In this example, we're
  // going to use React, so we'll just return a React element. `render` async.
  render () {
    const { Layout, PageLayout=<div />, Page } = this.props;
    const props = omit(this.getPageProps(), ['context', 'Layout', 'Page', 'PageLayout' ]);

    if (this.props.Layout) {
      return (
        <Layout { ...props } key='layout'>
          <PageLayout { ...props }>
            <Page { ...props } />
          </PageLayout>
        </Layout>
      );
    }

    return (
      <PageLayout { ...props }>
        <Page { ...props } />
      </PageLayout>
    );
  }

  layout = null;
  page = null;
}
