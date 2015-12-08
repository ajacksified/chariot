class Controller {
  constructor (ctx, config) {
    const { req, res, props } = this.modifyContext(ctx);

    this.req = req;
    this.res = res;
    this.props = props;

    this.config = config;
  }

  loadData () {
    return new Map();
  }

  modifyContext (ctx) {
    let req = ctx.req;
    let res = ctx.res;

    let props = Object.assign({
      timings: {}
    }, ctx.props || {});

    if (this.req.env === Controller.env.SERVER) {
      req.synchronous = true;
      props.includeLayout = true;
    }

    return { req, res, props };
  }

  async get () {
    this.props.timings.start = Date.now();
    await this.preRender();
    this.props.timings.preRender = Date.now() - this.props.timings.start;
    await this.render();
    this.props.timings.render = Date.now() - this.props.timings.preRender;
    await this.postRender();
    this.props.timings.postRender = Date.now() - this.props.timings.render;
  }

  async loadDataPreRender (synchronous, promises) {
    let dataCache = {};
    let data = {};

    if (!synchronous || !promises) {
      return { data, dataCache };
    }

    const entries = promises.entries();
    const values = promises.values();

    if (!entries) {
      return { data, dataCache };
    }

    data = await Promise.all([...values]);

    let i = 0;
    for (var [key, value] of entries) {
      dataCache[key] = data[i];
      i++;
    }

    return { data, dataCache };
  }

  async preRender () {
    const promises = this.loadData();

    const {
      data,
      dataCache,
    } = await this.loadDataPreRender(this.req.synchronous, promises);

    this.props.data = data;
    this.props.dataCache = dataCache;
  }

  async render () {
    this.req.body = this.body;
  }

  async postRender () {
    return Promise.resolve();
  }

  static env = {
    SERVER: 'SERVER',
    CLIENT: 'CLIENT',
  }
}

export default Controller;
