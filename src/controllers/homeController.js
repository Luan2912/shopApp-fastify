const handleHelloWorld = (req, reply) => {
    reply.send("Hello World");
};

module.exports = {
    handleHelloWorld
};
