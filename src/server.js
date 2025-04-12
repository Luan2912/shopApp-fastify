const shopApp = require('fastify')({ logger: true });
const configEngine = require('./configs/configEngine.js');
require("dotenv").config();

const PORT = process.env.PORT || 3001;
const MONGO_URL = process.env.MONGO_URL;

// Đăng ký MongoDB
shopApp.register(require('@fastify/mongodb'), {
  forceClose: true,
  url: MONGO_URL
}).after(() => {
  console.log("MongoDB connection established");

  // Gắn db vào request
  shopApp.decorateRequest('db', null);

  // Đăng ký hook thêm db vào request
  shopApp.addHook('onRequest', async (request, reply) => {
    request.db = shopApp.mongo.db;
  });

  // Đảm bảo plugin @fastify/formbody được đăng ký sau khi MongoDB đã sẵn sàng
  shopApp.register(require('@fastify/formbody'));

  // Đăng ký các route với MongoDB và các logic cần thiết
  shopApp.register(require('./routes/web'));

  // Đăng ký các cấu hình khác
  configEngine(shopApp);
});

const start = async () => {
  try {
    await shopApp.listen({ port: PORT });
  } catch (err) {
    shopApp.log.error(err);
    process.exit(1);
  }
};

start();
