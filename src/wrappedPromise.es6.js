export default class WrappedPromise {
  constructor (promiseFn) {
    this.call = promiseFn;

    this.fire = this.fire.bind(this);
    this.then = this.then.bind(this);
    this.error = this.error.bind(this);
  }

  preCall (fn) {
    this.res = fn();
    this._hasPrecall = true;
    this._promise = Promise.resolve(this.res);
    return this;
  }

  fire () {
    if (!this._promise) {
      this._promise = this.call();
    }

    return this;
  }

  then () {
    if (!this._promise) { this.fire(); }

    return this._promise.then(...arguments);
  }

  error () {
    if (!this._promise) { this.fire(); }

    return this._promise.error(...arguments);
  }

  preRender (fn) {
    fn(this._res, this._err);
    return this;
  }
}
