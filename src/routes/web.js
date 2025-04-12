const homeController = require("../controllers/homeController");
const userController = require("../controllers/userController");

async function webRoutes(fastify, options) {
  fastify.get("/", homeController.handleHelloWorld);
  fastify.get("/user", userController.handleUserPage);
  fastify.get('/user/create-user', userController.handleCreateUserPage);
  fastify.post('/user/create-user', userController.handleCreateUser);
}

module.exports = webRoutes;
