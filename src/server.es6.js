import React from 'react';
import ReactDOM from 'react-dom/server';

import Koa from 'koa';
import staticFiles from 'koa-static';
import body from 'koa-bodyparser';
import compress from 'koa-compress';
import session from 'koa-session';
import conditionalGet from 'koa-conditional-get';
import favicon from 'koa-favicon';
import etag from 'koa-etag';
import csrf from 'koa-csrf';
import uuid from 'node-uuid';
import convert from 'koa-convert';

import { App as Horse } from 'horse';
import Chariot from './app';

const App = Chariot(Horse);

export function requestGUID () {
  return async function (ctx, next) {
    ctx.guid = uuid.v4();
    await next();
  };
}

export function setServerContextProps(server) {
  return async function (ctx, next) {
    ctx.synchronous = true;
    ctx.includeLayout = true;

    ctx.props = {
      config: server.app.config,
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
  body,
};

export function injectBootstrap(ctx, format) {
  let p = { ...ctx.props };

  if (format) {
    p = format({...ctx.props});
  }

  delete p.app;
  delete p.api;
  delete p.manifest;
  delete p.dataPromises;

  const bootstrap = safeStringify(p);

  const body = ctx.body;

  if (body && body.lastIndexOf) {
    const bodyIndex = body.lastIndexOf('</body>');
    const template = `<script>window.bootstrap=${bootstrap}</script>`;
    ctx.body = body.slice(0, bodyIndex) + template + body.slice(bodyIndex);
  }
}

export function safeStringify (obj) {
  return JSON.stringify(obj)
    .replace(/&/g, '\\u0026')
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E');
}

const GeneratorFunction = Object.getPrototypeOf(eval("(function*(){})")).constructor;

export default class Server {
  constructor (serverConfig, appConfig) {
    this.config = serverConfig;

    this.middleware = serverConfig.middleware || [];
    this.middleware.push(setServerContextProps(this));

    this.app = new App(appConfig);

    this.warn(serverConfig);

    this.server = new Koa();
    this.server.keys = this.config.keys;

    if (this.config.errorHandler) {
      this.error = this.config.errorHandler;
    }
  }

  warn (serverConfig) {
    if (!serverConfig.keys) {
      console.log('No `keys` passed into serverConfig; your sessions are insecure.');
    }
  }

  enableMiddleware(middleware) {
    this.middleware.push(middleware);
  }

  loadRoutes(routes) {
    routes(this.app);
  }

  async render (ctx) {
    //todo figure out html template
    ctx.type = 'text/html; charset=utf-8';

    try {
      if (React.isValidElement(ctx.body)) {
        let body = ReactDOM.renderToStaticMarkup(ctx.body);
        ctx.body = body;//layout.replace(/!!CONTENT!!/, body);
      }
    } catch (e) {
      ctx.props.app.error(e, ctx, ctx.props.app);
      await this.render(ctx);
    }
  }

  serverRender (app) {
    return async (ctx, next) => {
      ctx.timings = {};

      if (ctx.accepts('html')) {
        const routeStart = Date.now();
        await app.route(ctx, next);
        ctx.timings.route = Date.now() - routeStart;
      }

      const renderStart = Date.now();
      await this.render(ctx);
      ctx.timings.render = Date.now() - renderStart;

      await injectBootstrap(ctx, this.config.formatBootstrap);
    }
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

    this.server.use(this.serverRender(this.app));
    this.server.listen(this.config.port);

    this.started = true;
    console.log(`Server istening on ${this.config.port}`);
  }
}
