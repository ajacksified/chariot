export default function (horse) {
  return class App extends horse {
    get (klass) {
      return async function buildController (ctx, next) {
        // TODO why do these have to be lets? what's going on. Something is
        // hanging on to a reference somewhere.
        let controller = new klass(ctx, this);
        await controller.get(ctx, next);
      }.bind(this);
    }
  };
}
