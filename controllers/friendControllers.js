const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const sendFriendRequest = asyncHandler(async (req, res) => {
    const senderId = req.user.id;
    const receiverId = parseInt(req.params.receiverId);
    const io = req.app.get("io");


    if (senderId === receiverId) {
        return res.status(400).json({ message: "You cannot send a friend request to yourself." });
    }

    const existingRequest = await prisma.friend.findFirst({
        where: {
            OR: [
                { userId: senderId, friendId: receiverId },
                { userId: receiverId, friendId: senderId }
            ],
        },
    });

    // Check if a friend request already exists.
    // If this is the case, then it means that either they are friends or there is a pending request.
    // Handle these two cases later if needed.
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
        senderId: req.user.id,
        request,
    });

    res.status(201).json({ message: "Friend request sent", friendRequest });
});


const getFriendRequest = asyncHandler(async (req, res) => {
    const requestId = parseInt(req.params.requestId);

    const friendRequest = await prisma.friend.findUnique({
        where: { id: requestId },
        include: { user: true, friend: true }
    });

    if (!friendRequest) {
        return res.status(404).json({ message: "Friend request not found." });
    }

    res.status(200).json(friendRequest);
});

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

    await prisma.friend.update({ where: { id: requestId } });

    io.to(senderId).emit("friend-request-accepted", { receiverId });
    io.to(receiverId).emit("friendship-created", { senderId });


    res.status(200).json({ message: "Friend request accepted." });
});


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

    await prisma.friend.delete({
        where: { id: requestId },
    });

    res.status(200).json({ message: "Friend request rejected." });
});

const deleteFriend = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const friendId = parseInt(req.params.friendId);

    const friendship = await prisma.friend.findFirst({
        where: {
            OR: [
                { userId: userId, friendId: friendId },
                { userId: friendId, friendId: userId },
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


const getAllFriendRequests = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Fetch pending incoming requests
    const incomingRequests = await prisma.friend.findMany({
        where: { friendId: userId },
        include: { user: true },
    });

    // Fetch pending outgoing requests
    const outgoingRequests = await prisma.friend.findMany({
        where: { userId: userId },
        include: { friend: true },
    });

    res.status(200).json({ incomingRequests, outgoingRequests });
});

const getAllFriends = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Fetch all accepted friendships where the user is either the `userId` or `friendId`.
    const friends = await prisma.friend.findMany({
        where: {
            OR: [
                { userId: userId },
                { friendId: userId },
            ],
        },
        include: {
            user: true, // Include user details for friends where userId is the friend.
            friend: true, // Include friend details for friends where friendId is the friend.
        },
    });

    // Transform the results to get a consistent list of friends (excluding self-references).
    const friendList = friends.map((friendship) => {
        if (friendship.userId === userId) {
            return friendship.friend; // The other person is the friend.
        }
        return friendship.user; // The other person is the user.
    });

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
}
