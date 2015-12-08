// server.es6.js

// Use any horse app (such as horse-cart) that implements the base horse
// interface. Used primarily for `render`, routing, and the event emitter.
import App from 'horse-cart';

// Import the Chariot library.
import Chariot from 'chariot/src/client';

// Import routes file
import routes from './routes';

// Create a new chariot instance, passing in our App constructor
const chariot = new Chariot(App);

// Load in url routes
chariot.loadRoutes(routes);

chariot.start();
