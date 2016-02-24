// Exists to auto-populate certain props onto the context.

import React from 'react';

export default class PageWrapper extends React.Component {
  static childContexTypes = {
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
  }

  getChildContext() {
    const { api, app, req, cookies } = this.props;

    return {
      api,
      app,
      cookies,
      path: req.path,
      query: req.query,
      params: req.params,
      url: req.path,
      userAgent: req.userAgent,
      csrf: req.csrf,
      referrer: req.headers.referer,
      env: req.env,
    };
  }

  render () {
    return this.props.children;
  }
}
