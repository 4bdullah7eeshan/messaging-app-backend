const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");

const cloudinary = require("../config/cloudinary");


const prisma = new PrismaClient();

const createMessage = asyncHandler(async (req, res) => {
    const { content, targetId, isGroup } = req.body;  // Determine if it's a private or group message from frontend
    const userId = req.user.id;
    let fileUrl = null;
    const io = req.app.get("io");


    if (req.file) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: isGroup ? `group_${targetId}` : `user_${userId}`,
        });
        fileUrl = uploadResult.secure_url;
    }

    const messageData = {
        content,
        senderId: userId,
        fileUrl,
    };

    if (isGroup) {
        messageData.groupId = targetId;  // Add groupId entity for group message
    } else {
        messageData.receiverId = targetId;  // Add receiverId entity for private message
    }

    const message = await prisma.message.create({ data: messageData });

    if (isGroup) {
        io.to(targetId).emit("group-message", { message });
    } else {
        io.to(targetId).emit("private-message", { message });
    }

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

const getDistinctChats = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get distinct private chats
    const privateChats = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: userId },
                { receiverId: userId }
            ],
        },
        distinct: ['senderId', 'receiverId'], // Ensure each chat between two users is distinct
        include: {
            sender: true,
            receiver: true,
        },
    });

    // Get distinct group chats (where user is a member)
    const groupChats = await prisma.message.findMany({
        where: {
            OR: [
                { group: { members: { some: { id: userId } } } }, // Groups where the user is a member
            ],
        },
        distinct: ['groupId'], // Ensure each group chat is distinct
        include: {
            group: true,
        },
    });

    // Combine both private and group chats
    const allChats = [
        ...privateChats.map(chat => ({
            chatType: 'private',
            participants: chat.receiverId === userId ? chat.sender : chat.receiver,
            chatId: chat.id,
        })),
        ...groupChats.map(chat => ({
            chatType: 'group',
            participants: chat.group.name,  // Or any other group-related field
            chatId: chat.groupId,
        })),
    ];

    res.status(200).json(allChats);
});


module.exports = {
    createMessage,
    getMessage,
    getMessages,
    updateMessage,
    deleteMessage,
    getDistinctChats,
}