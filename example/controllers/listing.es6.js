import ListingPage from '../views/pages/listing';
import BaseController from './base';

class Listing extends BaseController {
  page = ListingPage;

  get data () {
    const { query, params, api } = this.context;
    const { sort, commentId, context } = query;
    const { listingId } = params;

    const commentParams = { 
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

    if (this.state.data.link) {
      this.props.title = this.state.data.link.title;
    }
  }
}

export default Listing;
