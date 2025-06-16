const {ObjectId} = require("mongodb");
const fs = require('fs');
const path = require('path');
const {deleteImageFromDisk} = require("../middlewares/handleUploadImage")
const {randomBytes, createHmac} = require("crypto")
const { getPaginationInfo } = require('../utils/paginationUtil');


const createNewUser = async (db, userData) => {
    try {
        const {email, username, password,phoneNumber,age,gender,address,role, avatarPath} = userData;
        const userCollection = db.collection('users');
        const checkData = await userCollection.findOne({$or: [{ email }, { username }]});
        if(checkData){
            return {
                success: false,
                messageErr: 'Email or username already exists',
            }
        }

        const salt =  randomBytes(16).toString('hex');
        const hmac = createHmac('sha256', salt);
        const hpass = hmac.update(password).digest('hex');

        const result = await userCollection.insertOne(
            {email, username, salt, hpass,phoneNumber,age,gender,address,role, avatarPath, createdAt: new Date()}
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

        let { page, limit } = req.pagination;
        let filter = req.filterUser || {};

        const totalDocs = await userCollection.countDocuments(filter);

        const { skip, limitDoc, pagination } = getPaginationInfo(totalDocs, page, limit);

        const users = await userCollection
            .find(filter)
            .skip(skip)
            .limit(limitDoc)
            .toArray();

        return {
            users,
            pagination
        };
    } catch (err) {
        console.error('>>> Lỗi khi lấy tất cả người dùng:', err);
        throw new Error('Database query failed');
    }
};



const getUserById = async (db, userId) => {
    try {
        const userCollection = db.collection('users');
        const userExist = await userCollection.findOne({ _id: new ObjectId(userId) });

        if(!userExist){
            return {
                success: false,
                messageErr: 'Người dùng không tồn tại!'
            }
        }

        return {
            success: true,
            userExist
        }
    } catch (err) {
        console.error('>>> Lỗi khi lấy người dùng theo ID:', err);
        throw err;
    }
};

const updateUser = async (db, userId, updateData) => {
    try {
        const userCollection = db.collection('users');
        const condition = [];

        if (updateData.email) {
            condition.push({ email: updateData.email });
        }
        if (updateData.username) {
            condition.push({ username: updateData.username });
        }

        // Nếu có ít nhất 1 trong 2 trường được update
        if (condition.length > 0) {
            const existingUser = await userCollection.findOne({
                $or: condition,
                _id: { $ne: new ObjectId(userId) }, // loại trừ chính người dùng đang cập nhật
            });

            if (existingUser) {
                const conflictField = (existingUser.email === updateData.email) ? 'Email' : 'Username';
                return {
                    success: false,
                    messageErr: `${conflictField} đã được sử dụng bởi người dùng khác.`,
                };
            }
        }

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
       deleteImageFromDisk(avatarPath)

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
