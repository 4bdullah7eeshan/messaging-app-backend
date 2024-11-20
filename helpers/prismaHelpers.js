const prisma = require("prisma");

const recordExists = async (model, field, value) => {
    const record = await prisma[model].findUnique({ where: { [field]: value } });
    return !!record;
};

module.exports = recordExists;