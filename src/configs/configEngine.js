const path = require("path");
const fastifyView = require("@fastify/view");
const fastifyStatic = require("@fastify/static");
const ejs = require("ejs");

const configEngine = async (fastify) => {
  // Cấu hình view engine
  fastify.register(fastifyView, {
    engine: {
      ejs: ejs,
    },
    root: path.join(__dirname, "../views"),
    propertyName: "render",
    viewExt: "ejs",
  });

  // Cấu hình static file
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, "../public"),
    prefix: "/public/", // URL bắt đầu bằng /public/ sẽ ánh xạ tới thư mục public
  });
};

module.exports = configEngine;
