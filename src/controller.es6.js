import React from 'react';

export default class Controller extends React.Component {
  static modifyContext (ctx) {
    const props = {
      ...ctx.props,
      timings: {},
    };

    if (ctx.req.env === Controller.env.SERVER) {
      props.includeLayout = true;
    }

    return { context: ctx, props };
  }

  constructor (ctx, app) {
    const modifiedCtx = Controller.modifyContext(ctx);

    super(modifiedCtx.props);

    this.props = modifiedCtx.props;
    this.props.app = app;

    this.context = modifiedCtx.context;
  }

  async get (ctx, next) {
    ctx.props.timings = {};
    ctx.props.timings.start = Date.now();
    await this.preRender();
    ctx.props.timings.preRender = Date.now() - this.props.timings.start;
    ctx.body = await this.render();
    ctx.props.timings.render = Date.now() - this.props.timings.preRender;

    return await next();
  }

  async loadDataPreRender (synchronous, promises={}) {
    const promiseMap = new Map();

    Object.keys(promises).forEach(k => {
      promiseMap.set(k, promises[k]);
    });

    const dataCache = {};

    if (!synchronous || !promiseMap.entries()) {
      return { data: promises, dataCache };
    }

    if (!promiseMap.entries()) {
      return { data: promises, dataCache };
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
    const promiseResults = await Promise.all([...promiseValues]);

    promiseValues.forEach((v, i) => {
      dataCache[promiseKeys[i]] = promiseResults[i];
    });

    return { data: promises, dataCache };
  }

  async preRender () {
    const promises = this.data;

    const {
      data,
      dataCache,
    } = await this.loadDataPreRender(this.context.synchronous, promises);

    this.props.data = data;
    this.props.dataCache = dataCache;
    this.state.data = this.props.dataCache;
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
