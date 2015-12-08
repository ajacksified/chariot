import React from 'react';
import Controller from 'chariot/controller';

import Layout from './views/layouts/default';

class Base extends Controller {
  get layout () {
    return Layout;
  }

  // Use `render` to return the contents of `this.body`. In this exampel, we're
  // going to use horse-react to render React, so we'll just set it to a React
  // element.
  render () {
    const Page = this.body;
    const props = this.props;

    if (props.includeLayout) {
      const Layout = this.layout;

      return (
        <Layout {...props} key='layout'>
          <Page {...props} />
        </Layout>
      );
    }

    return (
      <Page key={`${props.key}`} />
    );
  }
}
