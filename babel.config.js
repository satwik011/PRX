// Uniwind needs no Babel plugin. This file exists solely so Drizzle can inline
// its .sql migration files as strings at build time.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
