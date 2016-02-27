import BaseController from './base';

import IndexPage from '../views/pages/indexPage';

class Index extends BaseController {
  page = IndexPage;

  constructor (ctx, app) {
    super(ctx, app);

    const sub = ctx.params.subredditName;
    ctx.props.title = sub ? `r/${sub}` : 'reddit';
  }

  get data () {
    const { query, params, api, env } = this.ctx;
    const { before, after, sort } = query;
    const { subredditName } = params;

    const linkGetParams = {
      env,
      query: { sort, before, after, subredditName },
      origin: 'https://www.reddit.com',
    };

    const links = api.links.get(linkGetParams);

    const data = { links };

    if (subredditName) {
      const subreddit = api.subreddits.get({
        env,
        id: subredditName,
        query: {},
        origin: 'https://www.reddit.com',
      });

      data.subreddit = subreddit;
    }

    return data;
  }
}

export default Index;
