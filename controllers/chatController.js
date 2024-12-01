const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");

const cloudinary = require("../config/cloudinary");

const prisma = new PrismaClient();

const asyncHandler = require("express-async-handler");

const createChat = asyncHandler(async (req, res) => {
    const { type, groupId, participantIds } = req.body;

    if (groupId) {
        const chat = await prisma.chat.create({
            data: {
                type: 'GROUP',
                groupId,
                participants: {
                    connect: participantIds.map((id) => ({ id })),
                },
            },
        });
        return res.status(201).json({ message: 'Group chat created', chat });
    }

    if (!participantIds || participantIds.length !== 2) {
        res.status(400);
        throw new Error('Private chat must have exactly two participants.');
    }

    const chat = await prisma.chat.create({
        data: {
            type: 'PRIVATE',
            participants: {
                connect: participantIds.map((id) => ({ id })),
            },
        },
    });

    res.status(201).json({ message: 'Private chat created', chat });
});

const getUserChats = asyncHandler(async (req, res) => {
    const { userId } = req.params;


    const chats = await prisma.chat.findMany({
        where: {
            participants: {
                some: { id: parseInt(userId) },
            },
        },
        include: {
            participants: true,
            group: true,
            messages: {
                take: 1,
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    return res.status(200).json({ message: 'Chats fetched successfully', chats });

});

const getChatById = asyncHandler(async (req, res) => {
    const { chatId } = req.params;


    const chat = await prisma.chat.findUnique({
        where: { id: parseInt(chatId) },
        include: {
            participants: true,
            group: true,
            messages: true,
        },
    })

    if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
    }

    return res.status(200).json({ message: 'Chat fetched successfully', chat });

});

const updateChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { groupId, participantIds } = req.body;


    const chat = await prisma.chat.update({
        where: { id: parseInt(chatId) },
        data: {
            groupId,
            participants: {
                connect: participantIds?.map((id) => ({ id })),
            },
        }
    });

    return res.status(200).json({ message: 'Chat updated successfully', chat });

});

const deleteChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;


    await prisma.chat.delete({
        where: { id: parseInt(chatId) },
    });

    return res.status(200).json({ message: 'Chat deleted successfully' });

});

const addMessageToChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { senderId, content, imageUrl } = req.body;


    const message = await prisma.message.create({
        data: {
            chatId: parseInt(chatId),
            senderId,
            content,
            imageUrl,
        },
    });

    return res.status(201).json({ message: 'Message added successfully', message });

});






