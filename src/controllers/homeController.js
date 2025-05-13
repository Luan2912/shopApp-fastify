
const handleHomePage = async (req, reply) => {
  return reply.render("pages/homeView", {
    title: "BookNest - Nhà sách trực tuyến",
  });
};

module.exports = {
  handleHomePage
};
