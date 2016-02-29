import ListingPage from '../views/pages/listing';
import BaseController from './base';
import BaseLayout from '../views/layouts/base';

class Listing extends BaseController {
  page = ListingPage;
  pageLayout = BaseLayout;

  get data () {
    const { query, params, api, env } = this.ctx;
    const { sort, commentId, context } = query;
    const { listingId } = params;

    const commentParams = {
      env,
      sort: sort || 'confidence',
      linkId: listingId,
      query: {},
      origin: 'https://www.reddit.com',
    };

    if (commentId) {
      commentParams.query = {
        context,
        commentId,
      };
    }

    const linkParams = {
      env,
      id: `t3_${listingId}`,
      query: {},
      origin: 'https://www.reddit.com',
    };

    return {
      link: api.links.get(linkParams),
      comments: api.comments.get(commentParams),
    };
  }

  async preRender() {
    await super.preRender();
    const link = this.dataCache('link');

    if (link) {
      this.ctx.props.title = link.title;
    }
  }
}

export default Listing;
