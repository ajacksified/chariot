// server.es6.js

// Use any horse app (such as horse-react) that implements the base horse
// interface. Used primarily for `render`, routing, and the event emitter.
import App from 'horse-react/src/server';

// Import the Chariot library.
import Chariot from 'chariot/src/server';

// Import config from a file. It should return an object popluated with values
// from environment variables.
import config from './config';

// Import routes file
import routes from './routes';
import serverRoutes from './serverRoutes';

// Config is shared server/client; mix in  server-specific config here.
const serverConfig = Object.assign({
  processes: process.env.PROCESSES || 1,
  secretKeys: process.env.SECRET_KEYS.split(',') || ['tomato', 'tomahto']
}, config);

// Create a new chariot instance, passing in our App constructor
const chariot = new Chariot(App, serverconfig);

// Enable koa middleware with options. See MIDDLEWARE.md for list of available
// middlewares, or below example for how to enable your own custom middleware.
// Middleware will run in the order in which it is defined. (Use a Map instead
// of a plain object to ensure.) The `render` function is always defined last,
// so if you want to run something post-render, do so after yielding.
chariot.enableMiddleware(new Map({
  csrf: [],
  static: [`${__dirname}/../build`]
  compress: [],
  session: [chariot.koa, sessionOptions],
  conditional: [],
  favicon: [`${__dirname}/public/favicon.ico`],
  etag: []
}));

// Enable a custom middleware. Log the time before and after a request is
// responded to.
chariot.enableMiddleware(function * timings (ctx) {
  console.log(`Requesting ${ctx.url} at ${new Date()}`);
  yield* next;
  console.log(`Responding to ${ctx.url} at ${new Date()}`);
});

// Load in url routes
chariot.loadRoutes(routes);

// Load in server-only routes
chariot.loadRoutes(serverRoutes);

// App.render is automatically added as middleware before the start, then the
// koa server is started on config.port.
chariot.start();
