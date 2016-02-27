import React from 'react';

import Controller from './controller';
import Wrap from './wrappedPage';

// A reactController is also a React component.
// Define a `render` function at minimum. In this case, we want to
export default class ReactController extends Controller {
  layout = null;
  page = null;

  // Use `render` to return the contents of `this.page`. In this example, we're
  // going to use horse-react to render React, so we'll just return a React
  // element. `render` async.
  render () {
    const { ctx } = this;
    const Page = this.page;
    const PageLayout = this.pageLayout;

    const props = ctx.props;

    let Layout;

    if (ctx.includeLayout && this.layout) {
      Layout = this.layout;
    }

    return (
      <Wrap
        { ...props }
        Layout={ Layout }
        PageLayout={ PageLayout }
        Page={ Page }
        key={ Math.random() }
      />
    );
  }
}
