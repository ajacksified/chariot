import querystring from 'querystring';

import BaseController from './base';

import IndexPage from '../views/pages/indexPage';

class Index extends BaseController {
  page = IndexPage;

  static isStalePage (query, listings) {
    if (!listings || !query) { return; }

    if (query.before || query.after) {
      const { body, headers} = listings;

      if (!headers.before && !headers.after && !body.length) {
        return true;
      }
    }
  }

  static stalePageRedirectUrl (path, query={}) {
    let qs = '';

    if (query && Object.keys(query).length > 0) {
      const q = { ...query };
      delete q.before;
      delete q.after;
      delete q.page;
      delete q.count;

      if (Object.keys(q).length > 0) {
        qs = `?${querystring.stringify(q)}`;
      }
    }

    return `${path}${qs}`;
  }

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

    // precall sets the datacache immediately, which allows you to skip the
    // promise.
    //
    // prerender runs a function to validate data before `render` is called
    // on the server, or during the update cycle as the data comes in on the
    // client.

    const links = api.links.get(linkGetParams);
                    //wrap(api.links.get(linkGetParams));
                    //.preCall(api.loadFromCache('links', linkGetParams))
                    //.preRender(this.isStale.bind(this));

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

  isStale (data) {
    const { query, path, redirect } = this.ctx.context;
    const { body } = data;

    if (Index.isStalePage(query, body)) {
      redirect(Index.stalePageRedirectUrl(path, query));
      return true;
    }

    return false;
  }
}

export default Index;
