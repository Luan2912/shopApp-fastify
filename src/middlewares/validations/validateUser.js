const handleUploadImg = require('../handleUploadImage');

/**
 * Middleware validate dữ liệu tạo user:
 * - Parse multipart/form-data (form fields + file)
 * - Kiểm tra các trường bắt buộc
 * - Kiểm tra định dạng email, số điện thoại
 * - Kiểm tra xác nhận password
 * - Kiểm tra tuổi hợp lệ
 * - Xử lý upload ảnh (nếu có)
 * - Gán dữ liệu hợp lệ vào request.validatedUserData
 */
const validateUserData = (mode = 'create') =>{
return async (req, reply) => {
  try {
    const parts = req.parts();
    const formData = {};
    const errors = [];

    for await (const part of parts) {
        // console.log(">> Part:", part.fieldname, part.value);
      if (part.file && part.filename) {
        try {
          formData.avatar = await handleUploadImg.imageUpload(part, 'avatar-upload');
        } catch (uploadError) {
          console.error('>>> Lỗi khi upload ảnh: ', uploadError);
          errors.push('Lỗi khi upload ảnh: ' + uploadError.message);
        }
      } else {
        formData[part.fieldname] = part.value?.trim();
      }
    }

    // Kiểm tra trường bắt buộc
    if(mode === 'create'){
      const requiredFields = ['email', 'username', 'password'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        errors.push(`Thiếu trường bắt buộc: ${missingFields.join(', ')}`);
    }

  }

  if(mode==='login'){
    const requiredFields = ['email', 'password'];
    const missingFields = requiredFields.filter(field =>!formData[field]);
    if (missingFields.length >0){
      errors.push(`Thiếu trường bắt buộc: ${missingFields.join(', ')}`);
    }
  }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Email không hợp lệ.');
    }

   
    // Kiểm tra độ dài mật khẩu
    if (formData.password && formData.password.length < 6) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự.');
    }

     // Kiểm tra xác nhận mật khẩu
   if (mode === 'create' && formData.confirmPassword && formData.password !== formData.confirmPassword) {
        errors.push('Mật khẩu và xác nhận mật khẩu không khớp.');
      }


    // Kiểm tra số điện thoại (nếu có)
    if (formData.phoneNumber) {
      const phoneRegex = /^(0|\+84)\d{9,10}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        errors.push('Số điện thoại không hợp lệ');
      }
    }

    // Kiểm tra tuổi (nếu có)
    if (formData.age) {
      const age = parseInt(formData.age, 10);
      if (isNaN(age) || age <= 0 || age > 120) {
        errors.push('Tuổi không hợp lệ.');
      } else {
        formData.age = age;
      }
    }

    // Kiểm tra giới tính
    const allowedGenders = ['male', 'female', 'other'];
    if (formData.gender && !allowedGenders.includes(formData.gender)) {
      errors.push('Giới tính không hợp lệ! Chọn male, female hoặc other.');
    }

    //Kiểm tra role
    const allowedRoles = ['admin', 'customer'];
    if(formData.role && !allowedRoles.includes(formData.role)){
      errors.push('Quyền hạn không hợp lệ!')
    }


    // Gán dữ liệu hợp lệ và lỗi cho controller
    req.validatedUserData = formData;
    if (errors.length > 0) {
          if (formData.avatar && formData.avatar !== 'default-avatar-profile.png') {
            handleUploadImg.deleteImageFromDisk(formData.avatar);
    }

      req.validationErrors = errors;
      
    }
    
  } catch (error) {
    console.error(">>> Lỗi khi validate User:", error);
    req.validationErrors = ['Lỗi máy chủ khi xử lý dữ liệu'];
  }

  }
};

module.exports = validateUserData;
