import { transform, defaults } from 'lodash';
import { v4 } from 'uuid';

export function wrapCollections(collection, wrapper) {
  return transform(
    collection,
    (wrapped, content, contentName) => {
      wrapped[contentName] = wrapper(content, contentName, wrapped);
      return wrapped;
    },
    {}
  );
}

export function wrapNestedCollections(collections, wrapper) {
  return wrapCollections(
    collections,
    (collection, collectionName, wrappedCollections) => {
      return wrapCollections(
        collection,
        (item, itemName, wrappedCollection) => {
          return wrapper(
            item,
            itemName,
            wrappedCollection,
            collection,
            collectionName,
            wrappedCollections
          );
        }
      );
    }
  );
}

export function wrapTrack(
  collections,
  track = { origin: 'unknow', uuid: v4() }
) {
  return wrapNestedCollections(collections, (method) => {
    return (params, callback, overTrack) =>
      method(params, callback, overTrack || track);
  });
}
export function wrapTrackDbCruds(dbCruds, track) {
  return transform(dbCruds, (wrapped, schema, name) => {
    wrapped[name] = wrapTrack(schema, track);
    return wrapped;
  });
}

export function loggerTrack(
  logger,
  header,
  track = { origin: 'unknow', uuid: v4() }
) {
  return wrapCollections(logger, (method) => {
    return (message, context) =>
      method([header, message].join(' > '), defaults(track, context));
  });
}
