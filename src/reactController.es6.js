import React from 'react';
import Controller from './controller';

// A reactController is also a React component.
// Define a `render` function at minimum. In this case, we want to
class ReactController extends Controller {
  // Use `render` to return the contents of `this.page`. In this example, we're
  // going to use horse-react to render React, so we'll just return a React
  // element. `render` async.
  render () {
    const Page = this.page;
    const props = this.props;

    if (props.includeLayout && this.layout) {
      const Layout = this.layout;

      return (
        <Layout {...props} key='layout'>
          <Page {...props} />
        </Layout>
      );
    }

    return (
      <Page key={ props.key } />
    );
  }

  layout = null;
  page = null;
}

export default ReactController;
