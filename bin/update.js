const { Update } = require('../index')

Update.updateSchemas()
  .then((path) => console.log('Schemas have been updated.\n', path))
  .catch((error) => console.log('Schemas failed to update.\n', error))
