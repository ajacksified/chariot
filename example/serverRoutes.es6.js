const HEALTH = 'OK';
const ROBOTS = 'disallow *';

export default function routes (app) {
  const router = { app };

  router.get('robots.txt', async () => {
    return ROBOTS;
  });

  router.get('/health', async () => {
    return HEALTH;
  });
}
