import React from 'react';
import { omit } from 'lodash/object';

import Controller from './controller';
import Wrap from './wrappedPage';

// A reactController is also a React component.
// Define a `render` function at minimum. In this case, we want to
export default class ReactController extends Controller {
  layout = null;
  page = null;

  // Use `render` to return the contents of `this.page`. In this example, we're
  // going to use React, so we'll just return a React element. `render` async.
  render () {
    const { ctx, props } = this;
    const Page = this.page;
    const PageLayout = this.pageLayout;

    let Layout;

    if (ctx.includeLayout && this.layout) {
      Layout = this.layout;
    }

    return (
      <Wrap
        { ...props }
        context={ omit(ctx, 'props') }
        Layout={ Layout }
        PageLayout={ PageLayout }
        Page={ Page }
        key={ Math.random() }
      />
    );
  }
}
