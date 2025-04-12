const handleHelloWorld = (req, reply) => {
    const users = [
        { name: "Luan", age: 22 },
        { name: "Nhi", age: 21 }
    ];
    reply.render('homeView.ejs', { users });
};

module.exports = {
    handleHelloWorld
};
