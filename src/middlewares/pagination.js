const fp = require('fastify-plugin');

async function paginationMiddleware(fastify, options) {
    fastify.addHook('preHandler', async (req, rep) => {
        let { page = 1, limit = 10 } = req.query;

        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.max(1, parseInt(limit)); 

        req.pagination = {
            page: pageNumber,
            limit: limitNumber
        };
    });
}

module.exports = fp(paginationMiddleware); 
