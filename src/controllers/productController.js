const productService = require('../services/productService')
const querystring = require('querystring');
const handleUploadImg = require('../middlewares/handleUploadImage');

const handleManageProductPage = async (req, rep)=>{
    try {
        const db = req.db;
        const results = await productService.getProducts(db,req);

        return rep.render('pages/productView',{
            title:'Manage Product',
            query: req.query,
            products: results.products,
            pagination: results.pagination

        })

    } catch (error) {
        console.error('>>> Lỗi khi lấy danh sách sản phẩm:', error);
        return rep.send( {
            products: [],
            message: 'Có lỗi xảy ra khi tải danh sách sản phẩm!',
            type: 'danger'
        });
    }
}

const handleCreateProductPage = async(req,rep) =>{
    try {
        const categories = await req.db.collection('categories').find().toArray();

        return rep.render("pages/createProductView", {
            title: "Create Product",
            messageErr: null,
            categoriesList:categories,
            product: null
        })
    } catch (error) {
        console.error(error);
    }
}

const handleCreateProduct = async (req, rep) => {
    try {

        const db = req.db;

        const parts = req.parts();
        const formData = {};
        const errors = [];


        for await(const part of parts) {
            // console.log(">> Part:", part.fieldname, part.value);
            if (part.file && part.filename) {
                try {
                    formData.thumbnailProduct = await handleUploadImg.imageUpload(
                        part,'thumnails-product-upload'
                    );
                } catch (uploadError) {
                    console.error('>>> Lỗi khi upload ảnh: ', uploadError);
                    errors.push('Lỗi khi upload ảnh: ' + uploadError.message);
                }
            } else {
                const field = part.fieldname?.replace('[]', '');

                if (formData[field]) {
                // Nếu đã tồn tại thì đẩy thêm giá trị (vì categories[] gửi nhiều giá trị)
                if (Array.isArray(formData[field])) {
                    formData[field].push(part.value.trim());
                } else {
                    formData[field] = [formData[field], part.value.trim()];
                }
                } else {
                formData[field] = part.value?.trim();
                }
            }
        }

        if (errors.length > 0) {
      return rep.code(400).send({ message: 'Upload ảnh thất bại', errors });
    }

        if (formData.price) 
            formData.price = parseFloat(formData.price);
        if (formData.categories && !Array.isArray(formData.categories)) {
            formData.categories = [formData.categories]; // nếu chỉ chọn 1 danh mục
        }

        const dataProduct = {
            title: formData.title,
            author: formData.author,
            publisher: formData.publisher,
            price: formData.price,
            status: formData.status,
            categories: formData.categories,
            description: formData.description,
            thumbnailProduct: formData.thumbnailProduct
        };

        console.log("Danh mục: ", formData.categories);

        const result = await productService.createNewProduct(db, dataProduct);
        return rep.send({message: '>>>Create new product successfull', result: result});
    } catch (error) {
        console.error('>>> Lỗi khi tạo sản phẩm :', error);
        return rep.send({message: 'Lỗi khi tạo sản phẩm', type: 'danger'});
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
    handleCreateProductPage,
    handleCreateProduct,
    handleUpdateProductPage,
    handleUpdateProduct,
    handleDeleteProduct

};
