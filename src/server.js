const shopApp = require('fastify')({logger: true});
const configEngine = require('./configs/configEngine.js');
require("dotenv").config();

const PORT = process.env.PORT || 3001;
const MONGO_URL = process.env.MONGO_URL;

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
            limits: {
                fileSize: 10 * 1024 * 1024 // Giới hạn dung lượng file (10MB)
            }
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
