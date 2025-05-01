const productService = require('../services/productService')

const handleManageProductPage = async (req, rep)=>{
    try {
        const db = req.db;
        const products = await productService.getAllProducts(db);

        return rep.send(products)

    } catch (error) {
        console.error('>>> Lỗi khi lấy danh sách sản phẩm:', error);
        return reply.send( {
            users: [],
            message: 'Có lỗi xảy ra khi tải danh sách sản phẩm!',
            type: 'danger'
        });
    }
}

const handleCreateProduct = async (req, rep) =>{
    try {
        const {nameProduct, price, category} = req.body;
        const db = req.db;

        const result = await productService.createNewProduct(db, {nameProduct, price, category});
        return rep.send({
            message: '>>>Create new product successfull',
            result: result
        });
    } catch (error) {
        console.error('>>> Lỗi khi tạo sản phẩm :', error);
        return rep.send({
            message: 'Lỗi khi tạo sản phẩm',
            type: 'danger'
        });
    }

}



module.exports = {
handleManageProductPage,
    handleCreateProduct

};
