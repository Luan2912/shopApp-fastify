require('dotenv').config();
const jwt = require('jsonwebtoken');
function auth(req, reply, done) {
  const token = req.cookies?.token;

  if (!token) {
    return reply.redirect(
      `/login?messageErr=${encodeURIComponent('Bạn phải đăng nhập để truy cập trang web!')}`
    );
  }

  try {
    const user = jwt.verify(token, process.env.SECRET_KEY);
    req.user = user;
    done();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      // Token còn trong cookie nhưng đã hết hạn
      return reply.redirect(
        `/login?messageErr=${encodeURIComponent('Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.')}`
      );
    } else {
      // Token sai định dạng hoặc bị chỉnh sửa
      return reply.redirect(
        `/login?messageErr=${encodeURIComponent('Token không hợp lệ. Vui lòng đăng nhập lại.')}`
      );
    }
  }
}

module.exports = auth;
