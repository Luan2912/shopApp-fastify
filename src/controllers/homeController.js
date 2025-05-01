const handleHomePage = (req, reply) => {

    reply.render('homeView.ejs');
    // reply.render("registerView.ejs");
};

module.exports = {
    handleHomePage
};
