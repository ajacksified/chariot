// Exists to auto-populate certain props onto the context.

import React from 'react';

export default class PageWrapper extends React.Component {
  static childContexTypes = {
    api: React.PropTypes.object,
    app: React.PropTypes.object,
    path: React.PropTypes.string,
    query: React.PropTypes.object,
    params: React.PropTypes.string,
    url: React.PropTypes.string,
    userAgent: React.PropTypes.string,
    csrf: React.PropTypes.string,
    referrer: React.PropTypes.string,
    env: React.PropTypes.string,
  }

  getChildContext() {
    const { api, app, ctx } = this.props;

    return {
      api,
      app,
      path: ctx.path,
      query: ctx.query,
      params: ctx.params,
      url: ctx.path,
      userAgent: ctx.userAgent,
      csrf: ctx.csrf,
      referrer: ctx.headers.referer,
      env: ctx.env,
    };
  }

  render () {
    return this.props.children;
  }
}
