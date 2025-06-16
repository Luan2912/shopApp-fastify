const homeController = require("../controllers/homeController");
const userController = require('../controllers/userController');
const productController = require('../controllers/productController')
const loginController = require('../controllers/loginController')
const validateUserData = require('../middlewares/validations/validateUser')
const authorize = require('../middlewares/authorize')
const auth = require('../middlewares/auth')


const webRoutes = async (fastify) => {
    fastify.get('/', homeController.handleHomePage);

    fastify.get('/user',{preHandler: [auth, authorize(['admin'])]}, userController.handleUserPage); 
    fastify.get('/user/create-user',{preHandler: [auth, authorize(['admin'])]}, userController.handleCreateUserPage); 
    fastify.post(`/user/create-user`,{preHandler: [validateUserData('create'),auth, authorize(['admin'])] }, userController.handleCreateUser);
    fastify.get('/user/profile-user/:id',{preHandler: [auth, authorize(['admin'])]}, userController.handleUpdateUserPage);
    fastify.post('/user/profile-user/:id',{preHandler: [validateUserData('update'), auth,  authorize(['admin'])]}, userController.handleUpdateUser);
    fastify.post('/user/delete-user/:id',{preHandler: [auth, authorize(['admin'])]}, userController.handleDeleteUser)

    fastify.get('/manage-product', productController.handleManageProductPage);
    fastify.get('/manage-product/create-product', productController.handleCreateProductPage);
    fastify.post('/manage-product/create-product', productController.handleCreateProduct);
    fastify.get('/manage-product/update-product/:id', productController.handleUpdateProductPage);
    fastify.post('/manage-product/update-product/:id', productController.handleUpdateProduct);
    fastify.post('/manage-product/delete-product/:id', productController.handleDeleteProduct);

    fastify.get("/login", loginController.handleLoginPage);
    fastify.post("/login",{preHandler: validateUserData('login') }, loginController.handleLogin);
    fastify.get("/register", loginController.handleRegisterPage);
    fastify.post("/register",{preHandler:validateUserData('create')}, loginController.handleRegister);
    fastify.get("/logout", loginController.handleLogout);
};




module.exports = webRoutes;
