export default class App {
  constructor (horseKlass, config) {
    // should return a class that extends horseKlass instead? may make event
    // binding easier
    this._horse = new horseKlass(config);

    for (const k in this._horse) {
      this[k] = this._horse[k];
    }
  }

  get (klass) {
    return async function buildController (ctx, next) {
      const app = this;

      const props = {
        ctx,
        app,
      };

      const controller = new klass(props);
      await controller.get(next);
    };
  }

}
