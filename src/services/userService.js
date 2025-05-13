const { ObjectId } = require("mongodb");

const createNewUser = async (db, userData) => {
    try {
        const {email, username, password, avatarPath} = userData;
        const userCollection = db.collection('users');
        const result = await userCollection.insertOne({email, username, password,avatarPath});

        return {success: true, userId: result.insertedId};
    } catch (err) {
        console.error('>>> Lỗi khi lưu người dùng:', err);
        throw new Error('Database insert failed');
    }
};

const getAllUsers= async (db)=> {
    try {
        const userCollection = db.collection('users');
        const result = await userCollection
            .find()
            .toArray();
        return result;
    } catch (err) {
        console.error('>>> Lỗi khi lấy tất cả người dùng:', err);
        throw new Error('Database query failed');
    }}


const getUserById = async (db, userId) => {
    try {
        const userCollection = db.collection('users');
        return await userCollection.findOne({ _id: new ObjectId(userId) });
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
            updatedAt: new Date(),
        };

        return await userCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
        );
    } catch (error) {
        console.error('>>> Lỗi khi cập nhật người dùng:', error);
        throw error;
    }
};

const deleteUser= async(db,userID) =>{
   
    try{
        const userCollection = db.collection('users');
        const result = await userCollection.deleteOne({ _id: new ObjectId(userID) });
        return {
          success: result.deletedCount === 1
        };
    }
    catch (err){
        console.error('>>> Lỗi xóa người dùng: ', err)
        throw err;
    }
    
}





module.exports = {
    createNewUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
