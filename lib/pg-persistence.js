const { dbQuery } = require("./db-query");

module.exports = class PgPersistence {
  async createTodo(title) {
    const CREATE_TODO = "INSERT INTO todos" +
                        "  (title)" +
                        "  VALUES ($1)";

    let result = await dbQuery(CREATE_TODO, title);
    return result.rowCount > 0;
  }

  async deleteTodo(todoId) {
    const DELETE_TODO = "DELETE FROM todos" +
                        "  WHERE id = $1";

    let result = await dbQuery(DELETE_TODO, todoId);
    return result.rowCount > 0;
  }

  // both IDs must be numeric.
  async loadTodo(todoId) {
    const FIND_TODO = "SELECT * FROM todos" +
                      "  WHERE id = $1";

    let result = await dbQuery(FIND_TODO, todoId);
    return result.rows[0];
  }
  async sortedTodos() {
    const SORTED_TODOS = "SELECT * FROM todos" +
                         "  ORDER BY done ASC, lower(title) ASC";

    let result = await dbQuery(SORTED_TODOS);
    return result.rows;
  }

  async toggleDoneTodo(todoId) {
    const TOGGLE_DONE = "UPDATE todos SET done = NOT done" +
                        "  WHERE id = $1"

    let result = await dbQuery(TOGGLE_DONE, todoId);
    return result.rowCount > 0;
  }

};
