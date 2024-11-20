const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createGroup = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;  // Need this to make the user who created the group, an admin and first member

    const group = await prisma.group.create({
        data: {
            name,
            adminId: userId,  // Set the creator as the admin
            members: {
                connect: { id: userId },  // Add the creator as the first member
            },
        },
    });
    // Think if you want to allow user to put all group info like description/DP at the time of creation

    res.status(201).json({ message: "Group created successfully", group });

});


const getGroup = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const group = await prisma.group.findUnique({ where: { id: Number(id) } });
    if (!group) {
        res.status(404);
        throw new Error("Group not found");
    }

    res.status(200).json(group);
});



const updateGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { name, avatarUrl, description } = req.body;

    const group = await prisma.group.update({
        where: { id: Number(groupId) },
        data: { name, avatarUrl, description },
    });

    res.status(200).json(group);
});


const deleteGroup = asyncHandler(async (req, res) => {

});

const getAllUsersGroups = asyncHandler(async (req, res) => {

});

const getAllGroupMembers = asyncHandler(async (req, res) => {

});


const addUserToGroup = asyncHandler(async (req, res) => {

});

const removeUserFromGroup = asyncHandler(async (req, res) => {

});

const joinGroup = asyncHandler(async (req, res) => {

});

const exitGroup = asyncHandler(async (req, res) => {

});

module.exports = {
    createGroup,

}