const todosRouter = require('express').Router()

// Return all todos
todosRouter.get('/', async (request, response) => {
  let todos = await response.locals.store.sortedTodos()
  response.json(todos)
})
// Return a single todo
todosRouter.get("/:todoId", async (request, response) => {
  const todoId = request.params.todoId
  let todo = await response.locals.store.loadTodo(todoId)
  if (todo) {
    response.json(todo)
  } else {
    response.status(404).end()
  }
})
// Toggle completion status of a todo
todosRouter.post("/:todoId/toggle", async (request, response) => {
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
todosRouter.post("/:todoId/destroy", async (request, response) => {
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
todosRouter.post("/", async (request, response) => {
  const body = request.body

  if (!body.title) {
    return response.status(400).json({
      error: 'title missing'
    })
  }
  let created = await response.locals.store.createTodo(body.title)
  if (!created) {
    return response.status(400).json({
      error: 'Todo not created for some reason'
    })
  }
  response.redirect('/')
})

module.exports = todosRouter
