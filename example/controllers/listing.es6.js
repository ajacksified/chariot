import ListingPage from '../views/pages/listing';
import BaseController from './base';

class Listing extends BaseController {
  page = ListingPage;

  get data () {
    const { query, params, api } = this.context;
    const { sort, commentId, context } = query;
    const { linkId } = params;

    const commentParams = { linkId, sort, context, parentCommentId: commentId };

    return {
      link: api.links.get({ id: linkId }),
      comments: api.comments.get(commentParams),
    };
  }

  async preRender() {
    await super.preRender();

    if (this.props.dataCache.link) {
      this.props.title = this.props.dataCache.link.body.title;
    }
  }
}

export default Listing;
