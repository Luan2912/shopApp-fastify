const fp = require('fastify-plugin');

async function filterUser(fastify, opts) {
    fastify.addHook('preHandler', async (req, rep) => {
        const { minAge, maxAge, gender, username, age } = req.query;

        const filterUser = {};

        if (['male', 'female'].includes(gender)) {
            filterUser.gender = gender;
        }

        if (typeof username === 'string') {
            filterUser.username = {
                $regex: username,
                $options: 'i'
            };
        }

        const ageNumber = parseInt(age);
        if (!isNaN(ageNumber)) {
            filterUser.age = { $eq: ageNumber };
        }

        const min = parseFloat(minAge);
        const max = parseFloat(maxAge);

        if (!isNaN(min) || !isNaN(max)) {
            if (!filterUser.age || typeof filterUser.age !== 'object') {
                filterUser.age = {};
            }
            if (!isNaN(min)) {
                filterUser.age.$gte = min;
            }
            if (!isNaN(max)) {
                filterUser.age.$lte = max;
            }
        }

        req.filterUser = filterUser;
    });
}

module.exports = fp(filterUser);
