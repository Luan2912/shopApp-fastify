const {ObjectId} = require("mongodb");
const {getPaginationInfo} = require('../utils/paginationUtil');

const createNewProduct = async (db, productData) => {
    try {
        const {title,author,publisher, price, status, categories,description,thumbnailProduct } = productData;
        const productCollection = db.collection('products');
        const result = await productCollection.insertOne(
            {title,author,publisher, price, status, categories,description,thumbnailProductPath: productData.thumbnailProduct }
        )

        return {success: true, productId: result.insertedId}

    } catch (error) {
        console.error(">>>Lỗi khi lưu sản phẩm: ", error);
        throw new Error('Database insert failed');

    }
}

const getProductById = async (db, ProductId) => {
    try {
        const productCollection = db.collection('products');
        return await productCollection.findOne({_id: new ObjectId(ProductId)})
    } catch (error) {
        console.error(">>>Lỗi khi tìm kiếm sản phẩm; ", error)
    }
}

const getAllProducts = async (db, req) => {
    try {
        let filter = req.filterProduct || {};
        const productCollection = db.collection('products');
        const result = await productCollection
            .find(filter)
            .toArray();

        return result;
    } catch (error) {
        console.error('>>>Lỗi khi lấy tất cả sản phẩm: ', error);
        throw new Error('Database query failed!')
    }

}

const getProducts = async (db, req) => {
    try {

        const productCollection = db.collection('products');

        let {page, limit} = req.pagination;
        let filter = req.filterProduct || {};

        const totalDocs = await productCollection.countDocuments(filter);
        const {skip, limitDoc, pagination} = getPaginationInfo(totalDocs, page, limit);


        const products = await productCollection
           .find(filter)
            .skip(skip)
            .limit(limitDoc)
            .toArray();
            

        return {products, pagination};
    } catch (error) {
        console.error('>>>Lỗi khi lấy tất cả sản phẩm: ', error);
        throw new Error('Database query failed!')
    }

}

const updateProduct = async (db, productId, dataProduct) => {
    try {

        const productCollection = db.collection('products');
        const updateData = {
            price: dataProduct.price,
            category: dataProduct.category,
            updatedAt: new Date()
        };

        return await productCollection.updateOne({
            _id: new ObjectId(productId)
        }, {$set: updateData})
    } catch (error) {
        console.error(">>>Lỗi update sản phẩm: ", error)
    }
}

const deleteProduct = async (db, productId) => {
    try {
        const productCollection = db.collection('products');
        return await productCollection.deleteOne({_id: new ObjectId(productId)})
    } catch (error) {
        console.error(">>>Lỗi khi xóa sản phẩm: ", error)
    }

}

module.exports = {
    createNewProduct,
    getAllProducts,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
}