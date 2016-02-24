import React from 'react';

export default class Controller extends React.Component {
  constructor (props) {
    const { ctx, app, api } = props;
    const modifiedCtx = this.modifyContext(ctx, props);

    this.context = {
      api,
      app,
      req: modifiedCtx.req,
      cookies: ctx.cookies,
    };

    this.props = modifiedCtx.props;

    super(this.props);
  }

  modifyContext (ctx, props) {
    const req = ctx.req;

    // Delete ctx/app/api from props; these will go into context
    delete props.ctx;
    delete props.app;
    delete props.api;

    const modifiedProps = {
      timings: {},
      ...props,
    };

    if (req.env === Controller.env.SERVER) {
      req.synchronous = true;
      modifiedProps.includeLayout = true;
    }

    return { req, props: modifiedProps };
  }

  async get (next) {
    this.props.timings.start = Date.now();
    await this.preRender();
    this.props.timings.preRender = Date.now() - this.props.timings.start;
    this.body = await this.render();
    this.props.timings.render = Date.now() - this.props.timings.preRender;

    return await next();
  }

  async loadDataPreRender (synchronous, promises) {
    const promiseMap = new Map(promises);

    const dataCache = {};
    let data = {};

    if (!synchronous || !promiseMap.entries()) {
      return { data, dataCache };
    }

    if (!promiseMap.entries()) {
      return { data, dataCache };
    }

    // loop through promises, see if any have the value set from a preCall. if
    // they do, set it immediately rather than calling out to the promise.

    const promiseKeys = [];
    const promiseValues = [];

    promiseMap.forEach((val, key) => {
      if (val.res) {
        dataCache[key] = val.res;
      } else {
        promiseKeys.push(key);
        promiseValues.push(val);
      }
    });

    // Fulfill the non-fulfilled promises
    data = await Promise.all([...promiseValues]);

    promiseValues.forEach((v, i) => {
      dataCache[promiseKeys[i]] = data[i];
    });

    return { data, dataCache };
  }

  async preRender () {
    const promises = this.data();

    const {
      data,
      dataCache,
    } = await this.loadDataPreRender(this.context.req.synchronous, promises);

    this.props.data = data;
    this.props.dataCache = dataCache;
  }

  render () {
  }

  get data () {
    return new Map();
  }

  static env = {
    SERVER: 'SERVER',
    CLIENT: 'CLIENT',
  }
}
