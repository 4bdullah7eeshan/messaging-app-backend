const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const recordExists = async (model, field, value) => {
    try {
        const record = await prisma[model].findUnique({
            where: { [field]: value },
        });
        return !!record;  // Return true if the record exists, false otherwise
    } catch (error) {
        console.error("Error checking record existence:", error);
        return false;  // Return false if an error occurs (e.g., model or field does not exist)
    }
};

module.exports = recordExists;
