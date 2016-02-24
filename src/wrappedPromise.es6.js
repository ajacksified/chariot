export default class WrappedPromise {
  constructor (promise) {
    this.originalPromise = promise;

    this.wrapped = this.originalPromise
                    .then(this.resolve, this.reject);
  }

  preCall (fn) {
    this._hasPrecall = true;
    let res;

    try {
      res = fn();

      if (res !== undefined) {
        this.wrapped = new Promise((resolve) => resolve(res));
      }
    } catch (e) {
      this.wrapped = new Promise((_, reject) => reject(e));
    }

    // if `res` is not undefined, `dataCache` will be set to preCall in the
    // controller.
    this.res = res;
  }

  resolve (res) {
    this._res = res;
    return res;
  }

  reject (err) {
    this._err = err;
    throw new Error(err);
  }

  then (...args) {
    return this.wrapped.then.call(this, args);
  }

  error (...args) {
    return this.wrapped.then.call(this, args);
  }

  preRender (fn) {
    fn(this._res, this._err);
  }
}
