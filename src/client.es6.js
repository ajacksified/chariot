import Cart from 'horse-cart';
import Horse from 'horse-react/src/client';

import Chariot from './app';

const App = Chariot(Cart(Horse));

export default class Client {
  constructor (config) {
    this.config = config;
    this.middleware = config.middleware || [];

    const modifyContext = this.modifyContext;

    this.app = new App({
      ...config,
      modifyContext,
    });
  }

  modifyContext (ctx) {
    const stateCtx = this.getState('ctx');

    return {
      ...stateCtx,
      ...ctx,
    };
  }

  enableMiddleware(middleware) {
    this.app.router.use(middleware);
  }

  loadRoutes(routes) {
    routes(this.app);
  }

  start() {
    if (this.started) {
      throw new Error('Attempted to run `start` twice');
    }

    this.app.initialize();
    this.started = true;
  }
}
