const path = require("path");
const fastifyView = require("@fastify/view");
const ejs = require("ejs");

const configEngine = async (fastify) => {
  fastify.register(fastifyView, {
    engine: {
      ejs: ejs
    },
    root: path.join(__dirname, "../views"), 
    viewExt: "ejs"
  });
};

module.exports = configEngine;
