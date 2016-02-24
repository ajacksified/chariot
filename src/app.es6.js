import ReactDOM from 'react-dom/server';
import React from 'react';

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

      // Render react if it's a react element. Otherwise, we assume it's json or
      // text or whatever and we'll render it as is.
      if (React.isValidElement(this.body)) {
        ctx.body = ReactDOM.renderToString(this.body);
      }
    };
  }

}
