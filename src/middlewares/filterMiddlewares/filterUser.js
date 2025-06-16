const fp = require('fastify-plugin');

/**
 * Plugin: filterUser
 * --------------------------
 * Mục đích:
 *   - Tạo middleware xử lý tiền xử lý cho các route GET để lọc danh sách user.
 *   - Dựa vào các query param như: username, gender, age, minAge, maxAge.
 *   - Tạo object `req.filterUser` dùng cho truy vấn MongoDB.
 *
 * Cách hoạt động:
 *   - Nếu có `gender = male/female` -> lọc chính xác theo giới tính.
 *   - Nếu có `username` ->  lọc theo chuỗi regex không phân biệt hoa thường.
 *   - Nếu có `age` ->  lọc theo tuổi chính xác.
 *   - Nếu có `minAge` hoặc `maxAge` ->  lọc theo khoảng tuổi.
 *
 * Sử dụng:
 *   - Dùng cho các route GET như: GET /user?username=abc&minAge=18
 *   - Trong route handler, dùng: `req.filterUser` làm điều kiện truy vấn DB.
 * 
 */

async function filterUser(fastify) {
    fastify.addHook('preHandler', async (req, rep) => {
        const { minAge, maxAge, gender, keyword, age } = req.query;

        const filterUser = {};

        if (['male', 'female'].includes(gender)) {
            filterUser.gender = gender;
        }

        if (typeof keyword === 'string' && keyword.trim() !== '') {
            const regex = new RegExp(keyword.trim(), 'i');
            filterUser.$or = [
                {
                    username: regex
                }, {
                    email: regex
                }
            ];
        }
        const ageNumber = parseInt(age);
        if (!isNaN(ageNumber)) {
            filterUser.age = { $eq: ageNumber };
        }

        const min = parseInt(minAge);
        const max = parseInt(maxAge);       
        if (!isNaN(min) || !isNaN(max)) {
            filterUser.age = {};
            if (!isNaN(min)) filterUser.age.$gte = min;
            if (!isNaN(max)) filterUser.age.$lte = max;
        } else if (!isNaN(ageNumber)) {
            filterUser.age = { $eq: ageNumber };
        }

        req.filterUser = filterUser;
    });
}

module.exports = fp(filterUser);
