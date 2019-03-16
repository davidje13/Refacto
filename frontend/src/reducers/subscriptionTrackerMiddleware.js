import SubscriptionTracker from './SubscriptionTracker';
import SharedReducer from './SharedReducer';

let namespaceCounter = 0;

export default (makeSocketUrl, actionSet, actionErr) => {
  const namespace = `NS_SUB${namespaceCounter}`;
  namespaceCounter += 1;

  const typeSubscribe = `${namespace}_SUBSCRIBE`;
  const typeUnsubscribe = `${namespace}_UNSUBSCRIBE`;
  const typeUpdate = `${namespace}_UPDATE`;

  const fn = (store) => {
    const subscriptionTracker = new SubscriptionTracker(
      async (subscriptionId) => {
        const reducer = new SharedReducer(
          await makeSocketUrl(subscriptionId),
          (data) => store.dispatch(actionSet(subscriptionId, data)),
          (err) => store.dispatch(actionErr(subscriptionId, err)),
        );
        await reducer.awaitFirstData();
        return reducer;
      },
      (resource) => resource.close(),
    );

    return (next) => (action) => {
      const { type, subscriptionId } = action;

      switch (type) {
        case typeSubscribe:
          return subscriptionTracker.subscribe(subscriptionId);
        case typeUnsubscribe:
          return subscriptionTracker.unsubscribe(subscriptionId);
        case typeUpdate: {
          const reducer = subscriptionTracker.find(subscriptionId);
          if (reducer) {
            return reducer.apply(action.updater);
          }
          return next(action);
        }
        default:
          return next(action);
      }
    };
  };

  fn.subscribe = (id) => ({
    type: typeSubscribe,
    subscriptionId: id,
  });

  fn.unsubscribe = (id) => ({
    type: typeUnsubscribe,
    subscriptionId: id,
  });

  fn.action = (id, updater) => ({
    type: typeUpdate,
    subscriptionId: id,
    updater,
  });

  return fn;
};
