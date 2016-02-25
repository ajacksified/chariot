// server.es6.js

// Import the Chariot library.
import Chariot from 'chariot/src/server';

// Import config from a file. It should return an object popluated with values
// from environment variables.
import config from './config';

// Import routes file
import routes from './routes';
import serverRoutes from './serverRoutes';

// Config is shared server/client; mix in  server-specific config here.
const serverConfig = {
  processes: process.env.PROCESSES || 1,
  secretKeys: process.env.SECRET_KEYS.split(',') || ['tomato', 'tomahto'],
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

chariot.enableMiddleware(new Map({
  staticFiles: [`${__dirname}/../build`],
  requestGUID: [],
  favicon: [`${__dirname}/public/favicon.ico`],
  compress: [],
  session: [chariot.koa, sessionOptions],
  etag: [],
  conditionalGet: [],
}));

// Or, define middleware one at a time.
chariot.enableMiddleware('csrf', []);

// Enable a custom middleware. Log the time before and after a request is
// responded to.
chariot.enableMiddleware(async (ctx, next) => {
  console.log(`Requesting ${this.url} at ${new Date()}`);
  await next();
  console.log(`Responding to ${this.url} at ${new Date()}`);
});

// Load in url routes
chariot.loadRoutes(routes);

// Load in server-only routes
chariot.loadRoutes(serverRoutes);

// Chariot's `render` is automatically added as middleware before the start, then
// the koa server is started on config.port.
chariot.start();
