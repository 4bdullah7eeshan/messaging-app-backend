const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");

const cloudinary = require("../config/cloudinary");

const prisma = new PrismaClient();

const createGroup = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user.id;

    let avatarUrl = null;
    if (req.file) {
        // If a file is uploaded, upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: "groups",
            resource_type: "image",
        });
        avatarUrl = uploadResult.secure_url;
    }

    const group = await prisma.group.create({
        data: {
            name,
            description,
            avatarUrl,
            adminId: userId,
            members: {
                connect: { id: userId },
            },
        },
    });

    res.status(201).json({ message: "Group created successfully", group });
});


//


const getGroup = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const group = await prisma.group.findUnique({ where: { id: parseInt(id) } });
    if (!group) {
        return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(group);
});



const updateGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { name, description } = req.body;

    const group = await prisma.group.findUnique({ where: { id: parseInt(groupId) } });
    if (!group) {
        return res.status(404).json({ message: "Group not found" });
    }

    let avatarUrl = group.avatarUrl; // Retain current avatar if no new upload
    if (req.file) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: "groups",
            resource_type: "image",
        });
        avatarUrl = uploadResult.secure_url;
    }

    const updatedGroup = await prisma.group.update({
        where: { id: parseInt(groupId) },
        data: { name, avatarUrl, description },
    });

    res.status(200).json(updatedGroup);
});


const deleteGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id; // Need this to know who is attempting to delete the group.
    const io = req.app.get("io");


    const group = await prisma.group.findUnique({
        where: { id: parseInt(groupId) },
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

    io.to(groupId).emit("group-deleted", { groupId });


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
        where: { id: parseInt(groupId) },
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
        where: { id: parseInt(groupId) },
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
        where: { id: parseInt(userId) },
    });

    // Check if the user being added exists
    if (!user) {
        res.status(404).json({ message: "User not found" });
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

    if (isMember.length > 0) {
        res.status(400).json({ message: "User is already a member of this group" });
        return;
    }

    // Just update the group members
    await prisma.group.update({
        where: { id: parseInt(groupId) },
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
        where: { id: parseInt(groupId) },
    });

    if (!group) {
        res.status(404).json({ message: "Group not found" });
        return;
    }

    const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
    });

    // Check if the user being added exists
    if (!user) {
        res.status(404).json({ message: "User not found" });
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
        res.status(400).json({ message: "User is not a member of this group" });
        return;
    }

    if (group.adminId !== req.user.id) {
        res.status(403).json({ message: "Only the admin can remove members" });
        return;
    }

    // Just disconnect the user from the group
    await prisma.group.update({
        where: { id: parseInt(groupId) },
        data: {
            members: {
                disconnect: { id: parseInt(userId) },
            },
        },
    });

    res.status(200).json({ message: "User removed from group successfully" });

});

const joinGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;
    const io = req.app.get("io");


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

    io.to(groupId).emit("group-member-joined", { userId: req.user.id });


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

    if (group.adminId === userId) {
        res.status(403).json({ message: "Admin cannot leave the group" });
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

const getAllGroups = asyncHandler(async (req, res) => {
    const groups = await prisma.group.findMany({
        select: {
            name: true,
            avatarUrl: true,
            description: true,
            admin: true,
            members: true,
        },
    });

    res.status(200).json(groups);
});


module.exports = {
    createGroup,
    getGroup,
    updateGroup,
    deleteGroup,
    getAllUsersGroups,
    getAllGroupMembers,
    addUserToGroup,
    removeUserFromGroup,
    joinGroup,
    exitGroup,
    getAllGroups,
}