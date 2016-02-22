import Index from './controllers/index';
import Listing from './controllers/listing';

function routes (app) {
  const router = { app };

  router.get('/', app.get(Index));
  router.get('/r/:subreddit', app.get(Index));

  router.get('/r/:subreddit/comments/:listingId/:listingTitle/:listingId', app.get(Listing));

  router.get('/json', function (ctx) {
    ctx.body = {
      name: 'jack',
    };
  });
}

export default routes;
