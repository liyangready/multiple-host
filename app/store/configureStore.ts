let configureStore: any;

if (process.env.NODE_ENV === 'production') {
  configureStore = require('./configureStore.production').default;
} else {
  configureStore = require('./configureStore.development').default;
}

export default configureStore;
