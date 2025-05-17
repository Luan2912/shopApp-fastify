const homeController = require("../controllers/homeController");
const userController = require('../controllers/userController');
const productController = require('../controllers/productController')


const webRoutes = async (fastify) => {
    fastify.get('/', homeController.handleHomePage);

    fastify.get('/user', userController.handleUserPage); 
    fastify.get('/user/create-user', userController.handleCreateUserPage); 
    fastify.post('/user/create-user', userController.handleCreateUser);
    fastify.get('/user/profile-user/:id', userController.handleUpdateUserPage);
    fastify.post('/user/profile-user/:id', userController.handleUpdateUser);
    fastify.post('/user/delete-user/:id', userController.handleDeleteUser)

    fastify.get('/manage-product', productController.handleManageProductPage);
    fastify.post('/manage-product/create-product', productController.handleCreateProduct);
    fastify.get('/manage-product/update-product/:id', productController.handleUpdateProductPage);
    fastify.post('/manage-product/update-product/:id', productController.handleUpdateProduct);
    fastify.post('/manage-product/delete-product/:id', productController.handleDeleteProduct);
};


module.exports = webRoutes;
