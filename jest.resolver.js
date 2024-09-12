export default (path, options) => {
  // Call the defaultResolver, so we leverage its cache, error handling, etc.
  return options.defaultResolver(path, {
    ...options,
    // Use packageFilter to process parsed `package.json` before the resolution (see https://www.npmjs.com/package/resolve#resolveid-opts-cb)
    packageFilter: (pkg) => {
      // This is a workaround for https://github.com/uuidjs/uuid/pull/616
      //
      // jest-environment-node doesn't handle ESM modules, so we need to
      // transform it to CJS
      if (pkg.name === 'uuid') {
        delete pkg['exports'];
        delete pkg['module'];
      }
      return pkg;
    },
  });
};