import React from 'react';
import { isEqual } from 'lodash/lang';

// A reactController is also a React component.
// Define a `render` function at minimum. In this case, we want to
export default class WrappedPage extends React.Component {
  static childContextTypes = {
    api: React.PropTypes.object,
    app: React.PropTypes.object,
    cookies: React.PropTypes.object,
    path: React.PropTypes.string,
    query: React.PropTypes.object,
    params: React.PropTypes.string,
    url: React.PropTypes.string,
    userAgent: React.PropTypes.string,
    csrf: React.PropTypes.string,
    referrer: React.PropTypes.string,
    env: React.PropTypes.string,
  };

  getChildContext() {
    const { api, app, context, cookies } = this.props;

    return {
      api,
      app,
      cookies,
      path: context.path,
      query: context.query,
      params: context.object,
      url: context.path,
      userAgent: context.userAgent,
      csrf: context.csrf,
      referrer: context.referer,
      env: context.env,
    };
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
  }

  watchProperties(data, dataCache) {
    // Handle no-data error-page case
    if (data) {
      data.forEach((val, key) => {
        if (!dataCache[key]) {
          this.watch(key, val);
        }
      });

      if (isEqual([...this.props.data.keys()].sort(), Object.keys(this.state.data).sort())) {
        this.finish();
      }
    }
  }

  componentDidMount() {
    this.watchProperties(this.props.data, this.props.dataCache);
  }

  watch (property, promise) {
    promise.then((p) => {
      console.log(property, p);

      this.setState({
        data: {
          ...this.state.data,
          [property]: p.body ? p.body : p,
        },
        meta: {
          ...this.state.meta,
          [property]: p.headers,
        },
      });

      if (isEqual([...this.props.data.keys()].sort(), Object.keys(this.state.data).sort())) {
        this.finish();
      }
    }, (e) => {
      this.props.app.error(e, this.props.ctx, this.props.app);
      this.props.app.forceRender(this.props.ctx.body, this.props);
    });
  }

  finish () {
    if (this.state.finished === false) {
      this.props.app.emit('pageview', { ...this.props, data: this.state.data });
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
  // going to use horse-react to render React, so we'll just return a React
  // element. `render` async.
  render () {
    const { Layout, PageLayout=<div />, Page } = this.props;
    const props = this.getPageProps();

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
