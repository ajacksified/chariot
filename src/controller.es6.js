class Controller {
  constructor (props) {
    const { ctx, config } = props;
    const modifiedCtx = this.modifyContext(ctx);

    this.req = modifiedCtx.req;
    this.res = modifiedCtx.res;
    this.props = modifiedCtx.props;

    this.config = config;
  }

  modifyContext (ctx) {
    const req = ctx.req;
    const res = ctx.res;

    const props = {
      timings: {},
      ...ctx.props,
    };

    if (this.req.env === Controller.env.SERVER) {
      req.synchronous = true;
      props.includeLayout = true;
    }

    return { req, res, props };
  }

  * get (next) {
    this.props.timings.start = Date.now();
    yield this.preRender();
    this.props.timings.preRender = Date.now() - this.props.timings.start;
    this.body = yield this.render();
    this.props.timings.render = Date.now() - this.props.timings.preRender;

    yield next;
  }

  * loadDataPreRender (synchronous, promises) {
    const promiseMap = new Map(promises);

    const dataCache = {};
    let data = {};

    if (!synchronous || !promiseMap.entries()) {
      return { data, dataCache };
    }

    const entries = promiseMap.entries();
    const values = promiseMap.values();

    if (!entries) {
      return { data, dataCache };
    }

    data = yield Promise.all([...values]);

    let i = 0;
    let key;
    for ([key] of entries) {
      dataCache[key] = data[i];
      i++;
    }

    return { data, dataCache };
  }

  * preRender () {
    const promises = this.data();

    const {
      data,
      dataCache,
    } = yield this.loadDataPreRender(this.req.synchronous, promises);

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

export default Controller;
