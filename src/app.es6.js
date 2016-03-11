export default function (horse) {
  return class App extends horse {
    get (klass) {
      return async function buildController (ctx, next) {
        // TODO why do these have to be lets? what's going on. Something is
        // hanging on to a reference somewhere.
        ctx.app = this;
        let controller = new klass(ctx);
        await controller.get(ctx, next);
      }.bind(this);
    }

    error (e) {
      throw(e);
    }
  };
}
