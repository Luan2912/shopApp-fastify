const productService = require('../services/productService')

const handleHomePage = async (req, reply) => {
  const db = req.db;
  const products = await productService.getAllProducts(db,req);
  return reply.render("pages/homeView", {
    title: "BookNest - Nhà sách trực tuyến",
    user: req.user || null,
    books: products
  });
};


module.exports = {
  handleHomePage
};
