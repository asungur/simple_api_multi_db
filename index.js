const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const PgPersistence = require("./lib/pg-persistence") // add this
const res = require('express/lib/response')

app.use(express.json())
app.use(morgan('tiny'))
app.use(express.urlencoded({ extended: false }));

// Create a new datastore for postgres routes
app.use((req, res, next) => {
  if (!req.path.includes('/todos')) return next()
  res.locals.store = new PgPersistence(req.session)
  next()
});

// ROUTES USING MONGO
let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2020-01-10T17:30:31.098Z",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2020-01-10T18:39:34.091Z",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2020-01-10T19:20:14.298Z",
    important: true
  }
]

app.get('/', (req, res) => {
  res.redirect('/api/notes')
})

app.get('/api/notes', (req, res) => {
  res.json(notes)
})

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generateId(),
  }

  notes = notes.concat(note)

  response.json(note)
})

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find(note => note.id === id)

  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
})

// ROUTES USING POSTGRES
// Return all todos
app.get('/api/todos', (request, response) => {
  let todos = await response.locals.store.sortedTodos()
  res.json(todos)
})
// Return a single todo
app.get("/api/todos/:todoId", (request, response) => {
  const todoId = request.params.todoId
  let todo = await response.locals.store.loadTodo(todoId)
  if (todo) {
    response.json(todo)
  } else {
    response.status(404).end()
  }
})
// Toggle completion status of a todo
app.post("/api/todos/:todoId/toggle", (request, response) => {
  const body = request.body
  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }
  let todoId = body.todo
  let toggled = await response.locals.store.toggleDoneTodo(+todoId);
  if (!toggled) {
    return response.status(400).json({
      error: 'not found'
    })
  }
  let todo = await response.locals.store.loadTodo(+todoId)

  response.json(todo)
})
// Delete a todo
app.post("/api/todos/:todoId/destroy",(request, response) => {
  let todoId = request.params
  let deleted = await response.locals.store.deleteTodo(+todoId);
  if (!deleted) {
    return response.status(400).json({
      error: 'not found'
    })
  }
  response.status(204).end()
});
// Create a new todo and add it to the specified list
app.post("/api/todos", (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }
  let created = await response.locals.store.createTodo(todoTitle)
  if (!created) {
    return response.status(400).json({
      error: 'Todo not created for some reason'
    })
  }
  res.redirect('/api/todos')
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
