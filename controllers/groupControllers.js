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
        return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(group);
});



const updateGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { name, avatarUrl, description } = req.body;

    const group = await prisma.group.findUnique({ where: { id: Number(groupId) } });
    if (!group) {
        return res.status(404).json({ message: "Group not found" });
    }

    const updatedGroup = await prisma.group.update({
        where: { id: Number(groupId) },
        data: { name, avatarUrl, description },
    });

    res.status(200).json(updatedGroup);
});


const deleteGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id; // Need this to know who is attempting to delete the group.

    const group = await prisma.group.findUnique({
        where: { id: Number(groupId) },
    });

    // Check if the group exists
    if (!group) {
        res.status(404).json({ message: "Group not found" });
        return;
    }

    // Check if the user is the admin before deleting the group
    if (group.adminId !== userId) {
        res.status(403).json({ message: "Only the admin can delete the group" });
        return;
    }

    await prisma.group.delete({
        where: { id: parseInt(groupId) },
    });

    res.status(200).json({ message: "Group deleted successfully" });
});

const getAllUsersGroups = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const groups = await prisma.user.findUnique({ where: { id: userId } }).groups();

    res.status(200).json(groups);

});

const getAllGroupMembers = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const group = await prisma.group.findUnique({
        where: { id: Number(groupId) },
        include: { members: true },
    });

    if (!group) {
        res.status(404).json({ message: "Group not found" });
        return;
    }

    res.status(200).json(group.members);

});


const addUserToGroup = asyncHandler(async (req, res) => {
    const { groupId, userId } = req.params;

    const group = await prisma.group.findUnique({
        where: { id: Number(groupId) },
    });

    // Check if group exists in the first place
    if (!group) {
        res.status(404).json({ message: "Group not found" });
        return;
    }

    // Ensure the user adding members is an admin
    if (group.adminId !== req.user.id) {
        res.status(403).json({ message: "Only the admin can add members" });
        return;
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
    });

    // Check if the user being added exists
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    // Just update the group members
    await prisma.group.update({
        where: { id: Number(groupId) },
        data: {
            members: {
                connect: { id: user.id },
            },
        },
    });

    res.status(200).json({ message: "User added to group successfully" });

});

const removeUserFromGroup = asyncHandler(async (req, res) => {
    const { groupId, userId } = req.params;

    const group = await prisma.group.findUnique({
        where: { id: Number(groupId) },
    });

    if (!group) {
        res.status(404).json({ message: "Group not found" });
        return;
    }

    if (group.adminId !== req.user.id) {
        res.status(403).json({ message: "Only the admin can remove members" });
        return;
    }

    // Just disconnect the user from the group
    await prisma.group.update({
        where: { id: Number(groupId) },
        data: {
            members: {
                disconnect: { id: Number(userId) },
            },
        },
    });

    res.status(200).json({ message: "User removed from group successfully" });

});

const joinGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await prisma.group.findUnique({
        where: { id: parseInt(groupId) },
    });

    if (!group) {
        res.status(404).json({ message: "Group not found" });
        return;
    }

    // Check if the user is already a member
    const isMember = await prisma.group.findMany({
        where: {
            id: parseInt(groupId),
            members: {
                some: {
                    id: userId,
                },
            },
        },
    });

    if (isMember.length > 0) {
        res.status(400).json({ message: "You are already a member of this group" });
        return;
    }

    await prisma.group.update({
        where: { id: parseInt(groupId) },
        data: {
            members: {
                connect: { id: userId },
            },
        },
    });

    res.status(200).json({ message: "Successfully joined the group" });

});

const exitGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await prisma.group.findUnique({
        where: { id: parseInt(groupId) },
    });

    if (!group) {
        res.status(404).json({ message: "Group not found" });
        return;
    }

    const isMember = await prisma.group.findMany({
        where: {
            id: parseInt(groupId),
            members: {
                some: {
                    id: userId,
                },
            },
        },
    });

    if (isMember.length === 0) {
        res.status(400).json({ message: "You are not a member of this group" });
        return;
    }

    await prisma.group.update({
        where: { id: parseInt(groupId) },
        data: {
            members: {
                disconnect: { id: userId },
            },
        },
    });

    res.status(200).json({ message: "Successfully exited the group" });

});

module.exports = {
    createGroup,

}