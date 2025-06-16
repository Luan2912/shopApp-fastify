const { render } = require('ejs');
const loginService = require('../services/loginService')
const userService = require('../services/userService')

const handleLoginPage = (req, rep) => {
     const messageErr = [];
     if (req.query.messageErr) {
    messageErr.push(req.query.messageErr);
  }

    return rep.render('pages/loginView', {
        title: "Login",
        messageErr,
        messageSuccess: '',
        user: req.user||null

    })
};

const handleLogin = async (req, rep) => {
  try {
    const db = req.db;

    if (req.validationErrors) {
      console.log(">>> Có lỗi validation:", req.validationErrors);
      return rep.render('pages/loginView', {
        title: "Login",
        messageErr: req.validationErrors,
        user: req.user || null,
        messageSuccess:''
      });
    }

    const data = req.validatedUserData;
    const result = await loginService.login(db, data);

        if (result.success) {
      // Thiết lập cookie token
      rep.setCookie("token", result.token, {
        httpOnly: true,
        secure: false, // Bật true nếu dùng HTTPS
        path: "/",
        maxAge: 3600, // 24 giờ
      });

      // Redirect theo vai trò người dùng
      if (result.user.role === 'admin') {
        return rep.redirect('/user');  // Admin vào trang quản lý
      } else {
        return rep.redirect('/');      // Customer vào trang chủ
      }
    } else {
      return rep.render('pages/loginView', {
        title: "Login",
        messageErr: [result.messageErr],
        user: req.user || null,
        messageSuccess:''
      });
    }
  } catch (error) {
    console.error("Lỗi khi xử lý đăng nhập:", error);
    rep.status(500).send("Đã có lỗi xảy ra");
  }
};

const handleRegisterPage = (req, rep) =>{
  try {
   return rep.render('pages/registerView',
     {title: 'Register',
      data: {},
      messageSuccess: '',
      messageErr: []});

   
  } catch (error) {
    console.error(">>>Lỗi khi render trang Register: ", error)
  }
  
}

const handleRegister = async (req, rep) =>{
    try {
          const db = req.db;
          const data = req.validatedUserData;
          const messageErr = []
          
          if (req.validationErrors) {
              messageErr.push(...req.validationErrors);
               return rep.render('pages/registerView', {
                  title: 'Register',
                  messageErr,
                  data: data,
                  messageSuccess: ''
              })
          }
  
          const result = await userService.createNewUser(db, {
              email: data.email,
              username: data.username,
              password: data.password,
              phoneNumber: data.phoneNumber || null,
              age: data.age || null,
              gender: data.gender || null,
              address: data.address || null,
              role: 'customer',
              avatarPath: data.avatar || null
          });
  
          if (result.messageErr) {
              messageErr.push(result.messageErr)
  
          }
  
          if (messageErr.length > 0) {
              console.log(messageErr, messageErr.length)
              return rep.render('pages/registerView', {
                  title: 'Register',
                  messageErr,
                  data: data,
                  messageSuccess: ''
              })
          }
  
          return rep.render('pages/registerView', {
                  title: 'Register',
                  messageErr:[],
                  data: data,
                  messageSuccess: 'Đăng ký người dùng thành công!'
              })
      } catch (error) {
          console.error('>>> Lỗi khi đăng ký người dùng:', error);
      }
}

const handleLogout = async (req, rep) => {
  // Xóa cookie chứa JWT
  rep
    .clearCookie('token', { path: '/' })
    .redirect('/login');
};


module.exports = {
    handleLoginPage,
    handleLogin,
    handleRegisterPage,
    handleRegister,
    handleLogout
}