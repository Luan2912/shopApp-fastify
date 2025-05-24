const { render } = require('ejs');
const userService = require('../services/userService');
const imageUpload = require('../middlewares/imageUpload');
const querystring = require('querystring');


const handleUserPage = async (request, reply) => {
    try {
        const { users, pagination } = await userService.getUsers(request);
        return reply.render('pages/userView', {
            title: 'Manage-User',
            users,
            pagination,
            query: request.query,
        }
    );
    } catch (error) {
        console.error('>>> Lỗi khi lấy danh sách người dùng:', error);
        return reply.render('pages/userView', {
            title: 'Manage-User',
            users: [],
            pagination: {},
            message: 'Có lỗi xảy ra khi tải danh sách người dùng!',
            type: 'danger'
        });
    }
};


const handleCreateUserPage = async (request, reply) =>{
    try {
        return reply.render('pages/createUserView',{
            title: 'Create-User'

        })
    } catch (error) {
        return reply.send({
            message: 'Có lỗi xảy ra khi tạo trang tạo người dùng!',
        })
    }
}




const handleCreateUser = async (request, reply) => {
    try {
        const parts = request.parts();
        const formData = {};

        for await (const part of parts) {
             if (part.file && part.filename) {
                try {
                    formData.avatar = await imageUpload(part, 'avatar-upload');
                } catch (uploadError) {
                    console.error('>>> Lỗi khi upload ảnh:', uploadError);
                    return reply.status(400).send(uploadError.message);
                }
            } else {
                formData[part.fieldname] = part.value;
            }
        }

        const { email, username, password } = formData;
        if (!email || !username || !password) {
            return reply.status(400).send('Missing required fields');
        }

        const db = request.db;
        await userService.createNewUser(db, { 
            email, 
            username, 
            password, 
            avatarPath: formData.avatar || null
        });

        return reply.redirect('/user');
    } catch (error) {
        console.error('>>> Lỗi khi tạo người dùng:', error);
        return reply.render('pages/createUserView', {
            message: 'Lỗi khi tạo người dùng.',
            type: 'danger',
            title: 'Create-User'
        });
    }
};


// Hiển thị form cập nhật người dùng
const handleUpdateUserPage = async (request, reply) => {
    try {
        const db = request.db;
        const userId = request.params.id;
        const user = await userService.getUserById(db, userId);

        if (!user) {
            return reply.render("pages/updateUserView", {
                title: 'Profile User',
                user: null,
                message: 'Người dùng không tồn tại.',
                type: 'warning'
            });
        }

        return reply.render('pages/updateUserView', {
            title: 'Profile User',
            user: user
        });
    } catch (error) {
        console.error('>>> Lỗi khi hiển thị form cập nhật:', error);
        return reply.render('pages/updateUserView', {
            title: 'Edit-User',
            user: null,
            message: 'Lỗi khi hiển thị form cập nhật.',
            type: 'danger'
        });
    }
};

// Cập nhật người dùng
const handleUpdateUser = async (request, reply) => {
    try {
        const db = request.db;
        const userId = request.params.id;
        const parts = request.parts();
        const formData = {};
        
        
        for await(const part of parts) {
            if(part.file && part.filename){
                try{
                formData.avatar = await imageUpload(part, 'avatar-upload')
                }catch(error){
                    console.error('>>>Lỗi khi upload ảnh: ',error);
                    return reply.status(400).send(error.message);
                }
            }else{
                formData[part.fieldname] = part.value;
            }
        }

        const { email, username, password } = formData;

        
        
        await userService.updateUser(db, userId, {
            email: email,
            username: username,
            password: password,
            avatarPath: formData.avatar||null

        });
        return reply.redirect(`/user/profile-user/${userId}`);
    } catch (error) {
        console.error('>>> Lỗi khi cập nhật người dùng:', error);
        return reply.render('pages/updateUserView', {
            title: 'Profile User',
            user: null,
            message: 'Lỗi khi cập nhật người dùng.',
            type: 'danger'
        });
    }
};

const handleDeleteUser = async (req, rep) => {
    try {
        const db = req.db;
        const userId = req.params.id;
        const user = await userService.getUserById(db,userId)

        if (!user) {
            return rep.send(
                {user: null, message: 'Người dùng không tồn tại.', type: 'warning'}
            );
        }

        userService.deleteAvatar(user.avatarPath);

        await userService.deleteUser(db, userId);
        const query = req.query;

        // // Chuyển thành chuỗi query string
        const qs = querystring.stringify(query);

        // Redirect về trang user kèm query string giữ nguyên
        const redirectUrl = `/user${qs ? '?' + qs : ''}`;
        return rep.redirect(redirectUrl);
    } catch (error) {
        console.error(">>>Lỗi xóa người dùng", error);
        throw error;
    }
}

module.exports = {
    handleUserPage,
    handleCreateUser,
    handleUpdateUserPage,
    handleUpdateUser,
    handleDeleteUser,
    handleCreateUserPage
};
