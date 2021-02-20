// Helper function
const getUserByEmail = function(email, database) {
  // lookup magic...
  let user = {};
  const userList = Object.keys(database);
  for (let i = 0; i < userList.length; i++) {
    if (database[userList[i]]["email"] === email) {
      user = database[userList[i]];
    }
  }
  return user;
};

module.exports = getUserByEmail;