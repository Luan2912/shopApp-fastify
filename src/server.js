const shopApp = require('fastify')({logger: true});
const configEngine = require('./configs/configEngine.js');
const webRoutes = require('./routes/web.js');


require("dotenv").config();

//Khai báo các biến môi trường
const PORT = process.env.PORT || 3001;
const MONGO_URL = process.env.MONGO_URL;

// Kết nối MongoDB
shopApp.register(require('@fastify/mongodb'), {
    forceClose: true,
    url: MONGO_URL
});


configEngine(shopApp)  

shopApp.register(webRoutes);

const start = async () => {
    try {
        await shopApp.listen({port: PORT});
    } catch (err) {
        shopApp.log.error(err);
        process.exit(1);
    }
};

start();
