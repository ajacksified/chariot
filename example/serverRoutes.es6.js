const HEALTH = 'OK';
const ROBOTS = 'disallow *';

function routes (app) {
  const router = { app };

  router.get('robots.txt', async () => {
    return ROBOTS;
  });

  router.get('/health', async () => {
    return HEALTH;
  });
}

export default routes;
