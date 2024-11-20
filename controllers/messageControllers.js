const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createMessage = asyncHandler(async (req, res) => {
    const { content, targetId, isGroup } = req.body;  // Determine if it's a private or group message from frontend
    const userId = req.user.id;

    // Setup message data
    const messageData = {
        content,
        senderId: userId,
    };

    if (isGroup) {
        messageData.groupId = targetId;  // Add groupId entity for group message
    } else {
        messageData.receiverId = targetId;  // Add receiverId entity for private message
    }

    const message = await prisma.message.create({ data: messageData });

    res.status(201).json({ message: "Message created successfully", message });
});

const getMessages = asyncHandler(async (req, res) => {
    
});

const getMessage = asyncHandler(async (req, res) => {
    
});

const updateMessage = asyncHandler(async (req, res) => {
    
});

const deleteMessage = asyncHandler(async (req, res) => {
    
});