import ListingPage from '../views/pages/listing';
import BaseController from './base';

class Listing extends BaseController {
  page = ListingPage;

  get data () {
    const { req, api } = this.props;
    const { sort, commentId, context } = req.query;
    const { linkId } = req.params;

    const commentParams = { linkId, sort, context, parentCommentId: commentId };

    return {
      link: api.links.get({ id: linkId }),
      comments: api.comments.get(commentParams),
    };
  }
}

export default Listing;
