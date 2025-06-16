const shopApp = require('fastify')({logger: true});
const configEngine = require('./configs/configEngine.js');
require("dotenv").config();
const pagination = require('./middlewares/pagination.js');
const filterUser = require('./middlewares/filterMiddlewares/filterUser.js');
const filterProduct = require('./middlewares/filterMiddlewares/filterProduct.js');
const optionalAuth = require('./middlewares/optionalAuth')


shopApp.register(require("@fastify/cookie"), {
    hook: "onRequest"
});


const PORT = process.env.PORT || 3001;
const MONGO_URL = process.env.MONGO_URL;

shopApp.register(pagination);
shopApp.register(filterUser);
shopApp.register(filterProduct);

shopApp.addHook("preHandler", optionalAuth);
// Đăng ký MongoDB
shopApp
    .register(require('@fastify/mongodb'), {
        forceClose: true,
        url: MONGO_URL
    })
    .after(() => {
        console.log("MongoDB connection established");

        // Gắn db vào request
        shopApp.decorateRequest('db', null);

        // Đăng ký hook thêm db vào request
        shopApp.addHook('onRequest', async (request, reply) => {
            request.db = shopApp.mongo.db;
        });

        shopApp.register(require('@fastify/formbody'));
        shopApp.register(require('@fastify/multipart'), {
            addToBody: true, // Thêm dữ liệu form vào req.body
        });
        shopApp.register(require('./routes/web'));

        configEngine(shopApp);
    });

const start = async () => {
    try {
        await shopApp.listen({port: PORT});
    } catch (err) {
        shopApp
            .log
            .error(err);
        process.exit(1);
    }
};

start();
