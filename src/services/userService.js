const {ObjectId} = require("mongodb");
const fs = require('fs');
const path = require('path');

const createNewUser = async (db, userData) => {
    try {
        const {email, username, password, avatarPath} = userData;
        const userCollection = db.collection('users');
        const result = await userCollection.insertOne(
            {email, username, password, avatarPath}
        );

        return {success: true, userId: result.insertedId};
    } catch (err) {
        console.error('>>> Lỗi khi lưu người dùng:', err);
        throw new Error('Database insert failed');
    }
};

const getUsers = async (req) => {
    try {
        const db = req.db;
        const userCollection = db.collection('users');

        
        let {page, limit} = req.pagination;
        let filter = req.filterUser||{};

        const totalDocs = await userCollection.countDocuments(filter);
        let limitDoc = Math.min(limit, totalDocs || limit);


        let totalPage = Math.ceil(totalDocs / limit) || 1;
        let currentPage = Math.max(1, Math.min(page, totalPage));

        const nextPage = currentPage < totalPage ? currentPage + 1 : null;
        const prevPage = currentPage > 1 ? currentPage - 1 : null;


        const skip = (currentPage - 1) * limit;

        const users = await userCollection
            .find(filter)
            .skip(skip)
            .limit(limitDoc)
            .toArray();

        return {
            users,
            pagination: {
                currentPage,
                limit: limitDoc,
                totalDocs,
                totalPage,
                nextPage,
                prevPage
            }
        };
    } catch (err) {
        console.error('>>> Lỗi khi lấy tất cả người dùng:', err);
        throw new Error('Database query failed');
    }
};

const getUserById = async (db, userId) => {
    try {
        const userCollection = db.collection('users');
        return await userCollection.findOne({_id: new ObjectId(userId)});
    } catch (err) {
        console.error('>>> Lỗi khi lấy người dùng theo ID:', err);
        throw err;
    }
};

const updateUser = async (db, userId, data) => {
    try {
        const userCollection = db.collection('users');
        const updateData = {
            email: data.email,
            username: data.username,
            avatarPath: data.avatarPath || null,
            updatedAt: new Date()
        };

        return await userCollection.updateOne({
            _id: new ObjectId(userId)
        }, {$set: updateData});
    } catch (error) {
        console.error('>>> Lỗi khi cập nhật người dùng:', error);
        throw error;
    }
};

const deleteUser = async (db, userID) => {

    try {
        const userCollection = db.collection('users');
        const result = await userCollection.deleteOne({_id: new ObjectId(userID)});
        return {
            success: result.deletedCount === 1
        };
    } catch (err) {
        console.error('>>> Lỗi xóa người dùng: ', err)
        throw err;
    }

}

const deleteAvatar = (avatarPath) => {
    try {
        if (avatarPath) {
            const filePath = path.join(__dirname, '..', 'public', avatarPath);
            if (fs.existsSync(filePath)) {

                fs.unlinkSync(filePath); // Xóa tệp ảnh
                console.log(`Avatar deleted: ${filePath}`);
                return {avatarPath: filePath, message: "Xóa avatar thành công."};
            } else {
                console.log(`Avatar không tồn tại: ${filePath}`);
            }
        }

    } catch (error) {
        console.error('>>> Lỗi xóa avatar người dùng: ', error);
        throw error;
    }
};

module.exports = {
    createNewUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    deleteAvatar
};
