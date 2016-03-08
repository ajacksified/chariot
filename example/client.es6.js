// server.es6.js

import config from './config';
import Snoode from 'snoode';

// Import the Chariot library.
import Chariot from 'chariot/src/client';

// Import routes file
import routes from './routes';

// Create a new chariot instance, passing in our App constructor
const chariot = new Chariot(config);

chariot.enableMiddleware(async (ctx, next) => {
  ctx.api = new Snoode({
    debugLevel: 'info',
  });

  await next();
});

// Load in url routes
chariot.loadRoutes(routes);

Chariot.onLoad([chariot.start]);
