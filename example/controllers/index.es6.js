import querystring from 'querystring';

import BaseController from 'chariot/reactController';
import { wrap } from 'chariot/reactController';

import IndexPage from './views/pages/indexPage';

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

  constructor (props) {
    super(props);
    this.props.title = 'Home';
  }

  dataValidators (data, ctx) {
    if (data.links && data.links.length === 0 && (ctx.query.after || ctx.query.before)) {
      ctx.redirect(`${ctx.path}?error=refresh`);
      return false;
    }
  }

  get data () {
    const { query, params, api } = this.context;
    const { first, last, sort } = query;
    const { subredditName } = params;

    const linkGetParams = { sort, first, last, subreddit };

    // precall sets the datacache immediately, which allows you to skip the
    // promise.
    //
    // prerender runs a function to validate data before `render` is called
    // on the server, or during the update cycle as the data comes in on the
    // client.
    const links = wrap(api.links.get(linkGetParams))
                    .preCall(api.loadFromCache('links', linkGetParams))
                    .preRender(this.isStale);

    const subreddit = api.subreddit.get({
      id: subredditName,
    });

    return { links, subreddit };
  }

  isStale (data, ctx) {
    const { req } = this.props;
    const { query, path } = req;
    const { body } = data;

    if (Index.isStalePage(query, body)) {
      ctx.redirect(Index.stalePageRedirectUrl(path, query));
    }
  }
}

export default Index;
