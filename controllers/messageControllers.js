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
    const { targetId, isGroup } = req.params;
    const { lastMessageId } = req.query;  // Get ID of the last message loaded
    const userId = req.user.id;
    const messagesCount = 20;  // Set message count: number of messages to load per request

    let messages;

    if (isGroup) {
        // Group messages
        messages = await prisma.message.findMany({
            where: { groupId: parseInt(targetId) },
            orderBy: { createdAt: 'desc' }, // Sort in desc order
            take: messagesCount,
            cursor: lastMessageId ? { id: lastMessageId } : undefined,  // Start from the last loaded message
            include: { sender: true },
        });
    } else {
        // Private messages
        messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: parseInt(targetId) },
                    { senderId: parseInt(targetId), receiverId: userId },
                ],
            },
            orderBy: { createdAt: 'desc' },
            take: messagesCount,
            cursor: lastMessageId ? { id: lastMessageId } : undefined,
            include: { sender: true },
        });
    }

    // If no messages are found, return an empty array instead of 404
    if (!messages || messages.length === 0) {
        return res.status(200).json({
            messages: [],
            lastMessageId: null,  // No more messages, set lastMessageId to null
        });
    }

    // Send the messages, including the ID of the last message for the next query
    res.status(200).json({
        messages,
        lastMessageId: messages[messages.length - 1]?.id,  // ID of the last message loaded
    });
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
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({ where: { id: parseInt(messageId) } });

    if (!message) {
        return res.status(404).json({ message: "Message not found" });
    }

    await prisma.message.delete({
        where: { id: parseInt(messageId) },
    });

    res.status(200).json({ message: "Message deleted successfully" });
});

module.exports = {
    createMessage,
    getMessage,
    getMessages,
    updateMessage,
    deleteMessage,
}