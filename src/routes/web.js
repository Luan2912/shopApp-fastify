const homeController = require("../controllers/homeController");
const userController = require('../controllers/userController');
const productController = require('../controllers/productController')

// Đảm bảo khai báo đúng các route
const webRoutes = async (fastify) => {
    fastify.get('/', homeController.handleHomePage);

    fastify.get('/user', userController.handleUserPage); 
    fastify.post('/user', userController.handleCreateUser);
    fastify.get('/user/update-user/:id', userController.handleUpdateUserPage);
    fastify.post('/user/update-user/:id', userController.handleUpdateUser);
    fastify.post('/user/delete-user/:id', userController.handleDeleteUser)

    fastify.get('/manage-product', productController.handleManageProductPage);
    fastify.post('/manage-product/create-product', productController.handleCreateProduct);
};

// Xuất khẩu webRoutes
module.exports = webRoutes;
