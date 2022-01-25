const { Client } = require("pg");
const config = require('../utils/config');

const logQuery = (statement, parameters) => {
  let timeStamp = new Date();
  let formattedTimeStamp = timeStamp.toString().substring(4, 24);
  console.log(formattedTimeStamp, statement, parameters);
};

module.exports = {
  async dbQuery(statement, ...parameters) {
    let client = new Client({
      user: config.DBUSER,
      database: "todos",
      password: config.DBPASSWORD,
      port: 5432,
      host: 'localhost'
    });

    await client.connect();
    logQuery(statement, parameters);
    let result = await client.query(statement, parameters);
    await client.end();

    return result;
  }
};
