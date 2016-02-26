import fs from 'fs';

const HEALTH = 'OK';

export default function routes (app) {
  const { router } = app;
  let robots;

  fs.readFile('robots.txt', function(err, file) {
    if (file && !err) {
      robots = file.toString();
    }
  });

  router.get('robots.txt', async (ctx) => {
    if (!robots) {
      ctx.status = 503;
      return;
    }

    ctx.body = robots;
  });

  router.get('/health', async (ctx) => {
    ctx.body = HEALTH;
  });
}
