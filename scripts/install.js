const download = require('download');

download('http://kangoextensions.com/kango/kango-framework-latest.zip', 'kango', { extract: true })
  .catch((err) => {
    console.error(err);
  });
