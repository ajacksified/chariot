import Controller from './controllers/index';

const HEALTH = 'OK';
const ROBOTS = 'disallow *';

function routes (app) {
  const router = { app };

  router.get('robots.txt', function * () {
    return ROBOTS;
  });

  router.get('/health', function * () {
    return HEALTH;
  });
}

export default routes;
