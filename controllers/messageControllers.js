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
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({
        where: { id: parseInt(messageId) },
        include: { sender: true },
    });

    if (!message) {
        return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json(message);
});

const updateMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await prisma.message.findUnique({ where: { id: parseInt(messageId) } });

    if (!message) {
        return res.status(404).json({ message: "Message not found" });
    }

    const updatedMessage = await prisma.message.update({
        where: { id: parseInt(messageId) },
        data: { content },
    });

    res.status(200).json(updatedMessage);
});


const deleteMessage = asyncHandler(async (req, res) => {
    
});