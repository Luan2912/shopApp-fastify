const fp = require('fastify-plugin');
const { ObjectId } = require('mongodb');
/**
 * Plugin: filterProduct
 * --------------------------
 * Mục đích:
 *   - Tạo middleware xử lý tiền xử lý cho các route GET để lọc danh sách sản phẩm.
 *   - Dựa vào các query param như: title, author, price, category, publisher, status.
 *   - Tạo object `req.filterProduct` dùng cho truy vấn MongoDB.
 *
 * Cách hoạt động:
 *   - Nếu có `title`, `author`, `publisher` → lọc theo regex không phân biệt hoa thường.
 *   - Nếu có `category`, `status` → lọc chính xác theo chuỗi.
 *   - Nếu có `price`, `minPrice`, `maxPrice` → lọc theo đúng giá hoặc khoảng giá.
 */

async function filterProduct(fastify) {
    fastify.addHook('preHandler', async (req, rep) => {
        const {
            keyword,
            category,
            status,
            price,
            minPrice,
            maxPrice
        } = req.query;

        const filterProduct = {};

         // Tìm kiếm keyword theo nhiều trường: title, author, publisher
        if (typeof keyword === 'string' && keyword.trim() !== '') {
        const keywords = keyword.trim().split(/\s+/); // tách theo khoảng trắng
        const regexArray = keywords.map(k => new RegExp(k, 'i'));

        filterProduct.$and = regexArray.map(rgx => ({
            $or: [
            { title: rgx },
            { author: rgx },
            { publisher: rgx },
            { categoryNames: rgx }
            ]
        }));
}


        if (typeof category === 'string' && category.trim() !== '') {
            try {
                filterProduct.categories = new ObjectId(category.trim());
            } catch (err) {
                console.error('Invalid category ObjectId');
            }
            }


        if (typeof status === 'string' && status.trim() !== '') {
            filterProduct.status = status.trim();
        }

        // Price filter
        const priceNumber = parseFloat(price);
        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);

        if (!isNaN(min) || !isNaN(max)) {
            filterProduct.price = {};
            if (!isNaN(min)) filterProduct.price.$gte = min;
            if (!isNaN(max)) filterProduct.price.$lte = max;
        } else if (!isNaN(priceNumber)) {
            filterProduct.price = priceNumber;
        }

        req.filterProduct = filterProduct;
    });
}

module.exports = fp(filterProduct);
