import Controller from './controllers/index';

function routes (app) {
  const router = { app };

  router.get('robots.txt', function * () {
    return 'disallow *';
  });
}

export default routes;
