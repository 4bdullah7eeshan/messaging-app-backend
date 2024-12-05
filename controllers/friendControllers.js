const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Send Friend Request
const sendFriendRequest = asyncHandler(async (req, res) => {
    const senderId = req.user.id;
    const receiverId = parseInt(req.params.receiverId);
    const io = req.app.get("io");

    if (senderId === receiverId) {
        return res.status(400).json({ message: "You cannot send a friend request to yourself." });
    }

    const senderExists = await prisma.user.findUnique({ where: { id: senderId } });
    const receiverExists = await prisma.user.findUnique({ where: { id: receiverId } });

    if (!senderExists || !receiverExists) {
        return res.status(400).json({ message: "One or both users do not exist." });
    }

    const existingRequest = await prisma.friend.findFirst({
        where: {
            OR: [
                { userId: senderId, friendId: receiverId },
                { userId: receiverId, friendId: senderId },
            ],
        },
    });

    if (existingRequest) {
        return res.status(400).json({ message: "You are already friends or have a pending request." });
    }

    const friendRequest = await prisma.friend.create({
        data: {
            userId: senderId,
            friendId: receiverId,
        },
    });

    io.to(receiverId).emit("friend-request-received", {
        senderId: senderId,
        request: friendRequest,
    });

    res.status(201).json({ message: "Friend request sent", friendRequest });
});

// Get a Single Friend Request
const getFriendRequest = asyncHandler(async (req, res) => {
    const requestId = parseInt(req.params.requestId);

    const friendRequest = await prisma.friend.findUnique({
        where: { id: requestId },
        include: { user: true, friend: true },
    });

    if (!friendRequest) {
        return res.status(404).json({ message: "Friend request not found." });
    }

    res.status(200).json(friendRequest);
});

// Accept Friend Request
const acceptFriendRequest = asyncHandler(async (req, res) => {
    const requestId = parseInt(req.params.requestId);
    const userId = req.user.id;
    const io = req.app.get("io");

    const friendRequest = await prisma.friend.findUnique({
        where: { id: requestId },
    });

    if (!friendRequest) {
        return res.status(404).json({ message: "Friend request not found." });
    }

    if (friendRequest.friendId !== userId) {
        return res.status(403).json({ message: "You are not authorized to accept this request." });
    }

    const updatedRequest = await prisma.friend.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
    });

    io.to(friendRequest.userId).emit("friend-request-accepted", { receiverId: userId });
    res.status(200).json({ message: "Friend request accepted.", updatedRequest });
});

// Reject Friend Request
const rejectFriendRequest = asyncHandler(async (req, res) => {
    const requestId = parseInt(req.params.requestId);
    const userId = req.user.id;

    const friendRequest = await prisma.friend.findUnique({
        where: { id: requestId },
    });

    if (!friendRequest) {
        return res.status(404).json({ message: "Friend request not found." });
    }

    if (friendRequest.friendId !== userId) {
        return res.status(403).json({ message: "You are not authorized to reject this request." });
    }

    await prisma.friend.update({
        where: { id: requestId },
        data: { status: "DECLINED" },
    });

    res.status(200).json({ message: "Friend request rejected." });
});

// Delete Friend
const deleteFriend = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const friendId = parseInt(req.params.friendId);

    const friendship = await prisma.friend.findFirst({
        where: {
            OR: [
                { userId: userId, friendId: friendId, status: "ACCEPTED" },
                { userId: friendId, friendId: userId, status: "ACCEPTED" },
            ],
        },
    });

    if (!friendship) {
        return res.status(404).json({ message: "No friendship found." });
    }

    await prisma.friend.delete({
        where: {
            id: friendship.id,
        },
    });

    res.status(200).json({ message: "Friendship deleted." });
});

// Get All Friend Requests
const getAllFriendRequests = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const incomingRequests = await prisma.friend.findMany({
        where: { friendId: userId, status: "PENDING" },
        include: { user: true },
    });

    const outgoingRequests = await prisma.friend.findMany({
        where: { userId: userId, status: "PENDING" },
        include: { friend: true },
    });

    res.status(200).json({ incomingRequests, outgoingRequests });
});

// Get All Friends
const getAllFriends = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const friends = await prisma.friend.findMany({
        where: {
            OR: [
                { userId: userId, status: "ACCEPTED" },
                { friendId: userId, status: "ACCEPTED" },
            ],
        },
        include: {
            user: true,
            friend: true,
        },
    });

    const friendList = friends.map((friendship) =>
        friendship.userId === userId ? friendship.friend : friendship.user
    );

    res.status(200).json(friendList);
});

module.exports = {
    sendFriendRequest,
    getFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    deleteFriend,
    getAllFriendRequests,
    getAllFriends,
};
