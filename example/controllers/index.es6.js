import BaseController from './base';

import IndexPage from '../views/pages/indexPage';
import WrappedPromise from 'chariot/src/wrappedPromise';

class Index extends BaseController {
  page = IndexPage;

  constructor (ctx, app) {
    super(ctx, app);

    const sub = ctx.params.subredditName;
    ctx.props.title = sub ? `r/${sub}` : 'reddit';
  }

  get data () {
    const { query, params, api } = this.ctx;
    const { before, after, sort } = query;
    const { subredditName } = params;

    const linkGetParams = {
      sort,
      before,
      after,
      subredditName,
    };

    /*
    const links = new WrappedPromise(() => api.links.get(linkGetParams))
                      .preCall(() => [{ title: 'test' }]);
    */
    const links = () => api.links.get(linkGetParams);

    const data = { links };

    if (subredditName) {
      const subreddit = () => api.subreddits.get({
        id: subredditName,
      });

      data.subreddit = subreddit;
    }

    return data;
  }
}

export default Index;
