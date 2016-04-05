import React from 'react';
import { omit } from 'lodash/object';

import Controller from './controller';

import { createStore } from 'redux';
import { Provider } from 'react-redux';

// A reactController is also a React component.
// Define a `render` function at minimum. In this case, we want to
export default class ReactController extends Controller {
  layout = null;
  page = null;

  // Use `render` to return the contents of `this.page`. In this example, we're
  // going to use React, so we'll just return a React element. `render` async.
  render () {
    const { ctx } = this;
    const props = { ...this.props, ...omit(ctx, 'props') };

    props.data = props.dataCache;
    delete props.dataCache;

    const Page = this.page;
    const PageLayout = this.pageLayout || <div />;

    const store = createStore(state => state, props);

    if (ctx.includeLayout && this.layout) {
      const Layout = this.layout;

      return (
        <Provider store={ store } key={ Math.random() }>
          <Layout>
            <PageLayout>
              <Page />
            </PageLayout>
          </Layout>
        </Provider>
      );
    }

    return (
      <Provider store={ store } key={ Math.random() }>
        <PageLayout>
          <Page />
        </PageLayout>
      </Provider>
    );
  }
}
