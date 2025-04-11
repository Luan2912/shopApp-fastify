const homeController = require("../controllers/homeController");

async function webRoutes(fastify, options) {
  fastify.get("/", homeController.handleHelloWorld);
}

module.exports = webRoutes;