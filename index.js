const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const morgan = require('morgan')
const app = express()
const PgPersistence = require("./lib/pg-persistence")
const middleware = require('./utils/middleware')
const logger = require('./utils/logger') // to be used at mongo connection
const todosRouter = require('./controllers/todos')
const notesRouter = require('./controllers/notes')
const mongoose = require('mongoose')

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(express.json())
app.use(morgan('tiny'))
app.use(express.urlencoded({ extended: false }))
app.use(middleware.requestLogger)

// Create a new datastore for postgres routes
app.use((req, res, next) => {
  if (!req.path.includes('/todos')) return next()
  res.locals.store = new PgPersistence('test')
  next()
});

app.get('/', async (req, res) => {
  res.redirect('/api/notes')
})

app.use('/api/todos', todosRouter)
app.use('/api/notes', notesRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})
