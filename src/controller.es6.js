import WrappedPromise from './wrappedPromise';

export default class Controller {
  constructor (ctx) {
    this.props = { timings: {}, dataCache: {}, ...ctx.props };
    this.ctx = ctx;
  }

  dataCache(key) {
    if (!this.props || !this.props.dataCache || !this.props.dataCache[key]) {
      return;
    }

    return this.props.dataCache[key].body ?
           this.props.dataCache[key].body : this.props.dataCache[key];
  }

  async get (ctx, next) {
    this.props.timings = {};
    this.props.timings.start = Date.now();
    await this.preRender();
    this.props.timings.preRender = Date.now() - this.props.timings.start;
    ctx.body = this.render();
    this.props.timings.render = Date.now() - this.props.timings.preRender;
    ctx.props = this.props;

    return await next();
  }

  async loadDataPreRender (synchronous, promises={}) {
    const promiseMap = new Map();
    const dataCache = this.props.dataCache || {};

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
      return this.ctx.app.error(e, this.ctx, this.ctx.app);
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

      this.props.dataPromises = data;
      this.props.dataCache = dataCache;
    } catch (e) {
      return this.ctx.app.error(e, this.ctx, this.ctx.app);
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
