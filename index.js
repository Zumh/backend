
const app = require('./app') // actual express app
const config = require('./utils/config')
const logger = require('./utils/logger')

app.listen(config.PORT, () => {
  // we access environment variable by importing the configuration module
  logger.info(`Server running on port ${config.PORT}`)
})