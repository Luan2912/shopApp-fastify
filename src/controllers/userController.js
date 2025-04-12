const handleUserPage = async (request, reply) => {
    return reply.render('userView');
  };

  const handleCreateUserPage = async (request, reply) => {
    return reply.render('createUserView');
  };

  const handleCreateUser = async (request, reply) => {
    try {
      const { email, username, password } = request.body;
      const userCollection = request.db.collection('users');
      const result = await userCollection.insertOne({ email, username, password });
  
      return reply.code(201).send({
        message: 'User created successfully',
        userId: result.insertedId
      });
    } catch (err) {
      console.error('>>> Lỗi khi lưu người dùng:', err);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  };
  
  
 
  module.exports = {
    handleUserPage,
    handleCreateUserPage,
    handleCreateUser
  };
  