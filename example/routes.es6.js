import Index from './controllers/index';
import Listing from './controllers/listing';

export default function routes (app) {
  const { router } = app;

  router.get('/', app.get(Index));
  router.get('/r/:subredditName', app.get(Index));

  router.get('/r/:subredditName/comments/:listingId/:listingTitle/', app.get(Listing));

  router.get('/json', async function (ctx) {
    ctx.body = {
      name: 'jack',
    };
  });
}
