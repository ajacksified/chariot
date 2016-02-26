// server.es6.js

// Import the Chariot library.
import Chariot from 'chariot/src/server';
import { MIDDLEWARE_MAP } from 'chariot/src/server';

// Import config from a file. It should return an object popluated with values
// from environment variables.
import config from './config';

// TODO autoload manifest from build process
config.manifest = {
  'base.css': 'base.css',
  'client.js': 'client.js',
};

// Import routes file
import routes from './routes';
import serverRoutes from './serverRoutes';

import { v1 } from 'snoode';

const keys = process.env.SECRET_KEYS || 'tomato,tomahto';

// Config is shared server/client; mix in  server-specific config here.
const serverConfig = {
  processes: process.env.PROCESSES || 1,
  keys: keys.split(','),
  ...config,
};

// Create a new chariot instance, passing in our App constructor
const chariot = new Chariot(serverConfig);

// Enable koa middleware with options. See MIDDLEWARE.md for list of available
// middlewares, or below example for how to enable your own custom middleware.
// Middleware will run in the order in which it is defined. (Use a Map instead
// of a plain object to ensure.) The `render` function is always defined last,
// so if you want to run something post-render, do so after yielding.

const sessionOptions = {};

// Or, define middleware one at a time.
chariot.enableMiddleware(MIDDLEWARE_MAP.staticFiles(`${__dirname}/build`));
chariot.enableMiddleware(MIDDLEWARE_MAP.requestGUID());
chariot.enableMiddleware(MIDDLEWARE_MAP.favicon(`${__dirname}/public/favicon.ico`));
chariot.enableMiddleware(MIDDLEWARE_MAP.compress());
chariot.enableMiddleware(MIDDLEWARE_MAP.session(sessionOptions, chariot.server));
chariot.enableMiddleware(MIDDLEWARE_MAP.etag());
chariot.enableMiddleware(MIDDLEWARE_MAP.conditionalGet());
chariot.enableMiddleware(MIDDLEWARE_MAP.csrf());

// Enable a custom middleware. Log the time before and after a request is
// responded to.
chariot.enableMiddleware(async (ctx, next) => {
  console.log(`Requesting ${ctx.url} at ${new Date()}`);
  await next();
  ctx.set('x-guid', ctx.guid);
  console.log(`Responding to ${ctx.url} at ${new Date()}`);
});

chariot.enableMiddleware(async (ctx, next) => {
  ctx.api = new v1({
    debugLevel: 'info',
  });

  await next();
});

// Load in url routes
chariot.loadRoutes(routes);

// Load in server-only routes
chariot.loadRoutes(serverRoutes);

// Chariot's `render` is automatically added as middleware before the start, then
// the koa server is started on config.port.
chariot.start();
