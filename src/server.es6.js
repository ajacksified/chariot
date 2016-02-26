import Koa from 'koa';
import staticFiles from 'koa-static';
import compress from 'koa-compress';
import session from 'koa-session';
import conditionalGet from 'koa-conditional-get';
import favicon from 'koa-favicon';
import etag from 'koa-etag';
import csrf from 'koa-csrf';
import uuid from 'node-uuid';
import convert from 'koa-convert';

import Horse from 'horse-react/src/server';
import app from './app';

const App = app(Horse);

function requestGUID () {
  return async function (ctx, next) {
    ctx.guid = uuid.v4();
    await next();
  };
}

function setServerContextProps(server) {
  return async function (ctx, next) {
    ctx.synchronous = true;
    ctx.includeLayout = true;

    // TODO autload build manifest file
    ctx.props = {
      config: server.config,
    };

    await next();
  };
}

export const MIDDLEWARE_MAP = {
  staticFiles,
  compress,
  session,
  conditionalGet,
  favicon,
  etag,
  csrf,
  requestGUID,
};

const GeneratorFunction = Object.getPrototypeOf(eval("(function*(){})")).constructor;

export default class Server {
  constructor (config) {
    this.config = config;
    this.middleware = [setServerContextProps(this)];
    this.app = new App(config);

    this.warn(config);

    this.server = new Koa();
    this.server.keys = this.config.keys;
  }

  warn (config) {
    if (!config.keys) {
      console.log('No `keys` passed into config; your sessions are insecure.');
    }
  }

  enableMiddleware(middleware) {
    this.middleware.push(middleware);
  }

  loadRoutes(routes) {
    routes(this.app);
  }

  start() {
    if (this.started) {
      throw new Error('Attempted to run `start` twice on a server instance');
    }

    this.middleware.forEach((m) => {
      let middleware = m;

      if (m instanceof GeneratorFunction) {
        middleware = convert(m);
      }

      this.server.use(middleware);
    });

    this.server.use(Horse.serverRender(this.app));
    this.server.listen(this.config.port);

    this.started = true;
    console.log(`Server istening on ${this.config.port}`);
  }
}
