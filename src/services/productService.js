const {ObjectId} = require("mongodb");

const createNewProduct = async (db, productData) => {
    try {
        const {nameProduct, price, category} = productData;
        const productCollection = db.collection('products');
        const result = await productCollection.insertOne(
            {nameProduct, price, category}
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

const getAllProducts = async (db) => {
    try {
        const productCollection = db.collection('products');
        const result = await productCollection
            .find()
            .toArray();

        return result;
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

        return await productCollection.updateOne(
            { _id: new ObjectId(productId)},
            {$set: updateData})
    } catch (error) {
        console.error(">>>Lỗi update sản phẩm: ", error)
}
}

const deleteProduct = async(db, productId)=>{
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
    getProductById,
    updateProduct,
    deleteProduct
}