const productService = require('../services/productService')

const handleManageProductPage = async (req, rep)=>{
    try {
        const db = req.db;
        const products = await productService.getAllProducts(db);

        return rep.render('pages/productView',{
            title:'Manage Product',
            products: products
        })

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

const handleUpdateProductPage = async(req,rep) =>{
    try {
        const db = req.db;
        const ProductId = req.params.id;
        
        const product = await productService.getProductById(db, ProductId);
        return rep.send({
            existing: product,
            mess: 'Render Update-Product Page Successfull!'
        })
        
    } catch (error) {
        console.error(">>>Lỗi render trang Update-Product: ", error);
    }
}

const handleUpdateProduct = async(req, rep) =>{
    try {
        const db = req.db;
        const productId = req.params.id;
        const {price, category} = req.body;
    
        //Thiếu xử lý lỗi khi không tìm thấy sản phẩm
        const existingProduct = await productService.getProductById(db, productId);
    
    
        const result =  await productService.updateProduct(db, productId, {price, category});
        return rep.send({
            result: result,
            mess:"Update product successfull!!"
        }); 
    } catch (error) {
        console.error(">>>Lỗi khi cập nhật sản phẩm: ", error)
    }
}

const handleDeleteProduct = async (req, rep)=>{
    try {
        const db = req.db;
        const productId = req.params.id;

        const product = await productService.getProductById(db, productId);
        if(!product){
            return rep.send({
                product: null,
                message:"Sản phẩm không tồn tại!!!"
            })
        }

        const result = await productService.deleteProduct(db, productId);
        return rep.send({
            result: result,
            message: "Xóa sản phẩm thành công!!"
        })


    } catch (error) {
        console.error(">>>Lỗi khi xóa sản phẩm: ", error)
    }
}


module.exports = {
handleManageProductPage,
    handleCreateProduct,
    handleUpdateProductPage,
    handleUpdateProduct,
    handleDeleteProduct

};
