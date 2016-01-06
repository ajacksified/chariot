class App {
  constructor (horseKlass, config) {
    // should return a class that extends horseKlass instead? may make event
    // binding easier
    this._horse = new horseKlass(config);

    for (const k in this._horse) {
      this[k] = this._horse[k];
    }
  }

  get (klass) {
    const config = this.config;

    return function * buildController (next) {
      const ctx = this;

      const props = {
        ctx,
        config,
      };

      const controller = new klass(props);
      return yield controller.get(next);
    };
  }

}

export default App;
