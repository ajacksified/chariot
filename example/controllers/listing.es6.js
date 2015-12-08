import BaseController from './base';
import ListingPage from './views/pages/listing';

class Listing extends BaseController {
  get body () {
    return ListingPage;
  }

  loadData () {
    const { sort, commentId, context } = this.req.query;
    const { linkId } = this.req.params;
    const data = new Map();

    data.set('link',
      api.links.get({
        id: linkId
      })
    );

    data.set('comments',
      api.links.get({
        linkId,
        sort,
        context,
        parentCommentId: commentId
      })
    );

    return data;
  }
}

export default Listing;
