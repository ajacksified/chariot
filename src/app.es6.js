import ReactDOM from 'react-dom/server';

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
      yield controller.get(next);

      // if this.body is a react element
      this.body = ReactDOM.renderToString(this.body);
      //else, do nothing, just send back contents of this.body
    };
  }

}

export default App;
