const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const sendFriendRequest = asyncHandler(async (req, res) => {
    const senderId = req.user.id;
    const receiverId = parseInt(req.params.receiverId);

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

    res.status(201).json({ message: "Friend request sent", friendRequest });
});


const getFriendRequest = asyncHandler(async (req, res) => {

});

const acceptFriendRequest = asyncHandler(async (req, res) => {

});

const rejectFriendRequest = asyncHandler(async (req, res) => {

});

const deleteFriend = asyncHandler(async (req, res) => {
    
});

const getAllFriendRequests = asyncHandler(async (req, res) => {

});
