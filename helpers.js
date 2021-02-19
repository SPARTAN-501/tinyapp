const users = require("./express_server.js");

// Helper function
const getUserByEmail = function(email, database) {
  // lookup magic...
  let user = {};
  const userList = Object.keys(database);
  for (let i = 0; i < userList.length; i++) {
    if (users[userList[i]]["email"] === email) {
      user = users[userList[i]];
    }
  }
  return user;
};

module.exports = getUserByEmail;