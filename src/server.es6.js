import koa from 'koa';
import staticFiles from 'koa-static';
import compress from 'koa-compress';
import session from 'koa-session';
import conditionalGet from 'koa-conditional-get';
import favicon from 'koa-favicon';
import etag from 'koa-etag';
import uuid from 'node-uuid';

import Horse from 'horse-react/src/server';
import App from './app';

const MIDDLEWARE_MAP = {
  staticFiles,
  compress,
  session,
  conditionalGet,
  favicon,
  etag,
  requestGUID,
};

async function requestGUID(ctx, next) {
  ctx.guid = uuid.v4();
  next();
}

export default class Server {
  constructor (config) {
    this.config = config;
    this.middleware = [];
    this.app = new App(Horse, config);

    this.warn(config);
  }

  warn (config) {
    if (!config.keys) {
      console.log('No `keys` passed into config; your sessions are insecure.');
    }
  }

  enableMiddleware(middleware, config) {
    if (typeof middleware === 'function') {
      this.enableSingleMiddleware(middleware);
    } else if (typeof middleware === 'string') {
      this.enableSingleMiddleware(this.getMiddleware(middleware)(...config));
    }
  }

  getMiddleware(name) {
    const middleware = MIDDLEWARE_MAP[name];
    if (middleware) { return middleware; }
    throw new Error(`No middleware "${name}" registered.`);
  }

  enableSingleMiddleware(fn) {
    this.middleware.push(fn);
  }

  loadRoutes(routes) {
    routes(this.app);
  }

  start() {
    if (this.server) {
      throw new Error('Attempted to run `start` twice on a server instance');
    }

    const server = koa();
    server.keys = this.config.keys;

    this.middleware.forEach(function(m) {
      server.use(m);
    });

    server.use(Horse.serverRender(this.app));
    server.listen(this.config.port);

    this.server = server;
  }
}
