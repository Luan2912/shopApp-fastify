const { ObjectId } = require("mongodb");

const createNewProduct = async(db, productData ) => {
    try {
        const {nameProduct, price, category} = productData;
        const productCollection = db.collection('products');
        const result = await productCollection.insertOne({nameProduct, price, category})

        return {
            success: true,
            productId: result.insertedId
        }

    } catch (error) {
        console.error(">>>Lỗi khi lưu sản phẩm: ", error);
        throw new Error('Database insert failed');
        
    }
}

const getAllProducts = async(db) =>{
    try {
        const productCollection = db.collection('products');
        const result = await productCollection.find().toArray();

        return result;
    } catch (error) {
        console.error('>>>Lỗi khi lấy tất cả sản phẩm: ', error);
        throw new Error('Database query failed!')
    }

}

module.exports = {
    createNewProduct,
    getAllProducts
}