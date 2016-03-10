import WrappedPromise from './wrappedPromise';

export default class Controller {
  static modifyContext (ctx, app) {
    return {
      app,
      context: {
        path: ctx.path,
        query: ctx.query,
        params: ctx.object,
        url: ctx.path,
        userAgent: ctx.userAgent,
        csrf: ctx.csrf,
        referrer: ctx.headers.referer,
        env: ctx.env,
      },
      timings: {},
    };
  }

  constructor (ctx, app) {
    const modifiedCtx = Controller.modifyContext(ctx, app);
    this.props = { ...modifiedCtx, ...ctx.props };
    this.ctx = ctx;
  }

  dataCache(key) {
    if (!this.ctx.props || !this.ctx.props.dataCache || !this.ctx.props.dataCache[key]) {
      return;
    }

    return this.ctx.props.dataCache[key].body;
  }

  async get (ctx, next) {
    ctx.props.timings = {};
    ctx.props.timings.start = Date.now();
    await this.preRender();
    ctx.props.timings.preRender = Date.now() - ctx.props.timings.start;
    ctx.body = this.render();
    ctx.props.timings.render = Date.now() - ctx.props.timings.preRender;

    return await next();
  }

  async loadDataPreRender (synchronous, promises={}) {
    const promiseMap = new Map();
    const dataCache = this.ctx.props.dataCache || {};

    Object.keys(promises).forEach(k => {
      let apiCall;

      if (promises[k] instanceof WrappedPromise) {
        apiCall = promises[k].fire();
      } else {
        apiCall = promises[k]();
      }

      // If there is data in the dataCache, such as from the first request on
      // the client side, set the promise to resolve. Otherwise, set the promise
      // to whatever's in this.data, which will kick off the request.
      if (dataCache[k]) {
        promiseMap.set(k, Promise.resolve(dataCache[k]));
      } else {
        promiseMap.set(k, apiCall);
      }
    });

    if (!synchronous || !promiseMap.size) {
      return { data: promiseMap, dataCache };
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

    try {
      // Fulfill the non-fulfilled promises
      const promiseResults = await Promise.all([...promiseValues]);

      promiseValues.forEach((v, i) => {
        dataCache[promiseKeys[i]] = promiseResults[i];
      });
    } catch (e) {
      return this.ctx.props.app.error(e, this.ctx, this.ctx.props.app);
    }

    return { data: promiseMap, dataCache };
  }

  async preRender () {
    const promises = this.data;

    try {
      const {
        dataCache,
        data,
      } = await this.loadDataPreRender(this.ctx.synchronous, promises);

      this.ctx.props.dataPromises = data;
      this.ctx.props.dataCache = dataCache;
    } catch (e) {
      return this.ctx.props.app.error(e, this.ctx, this.ctx.props.app);
    }
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
