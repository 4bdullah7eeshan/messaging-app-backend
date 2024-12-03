const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");

const cloudinary = require("../config/cloudinary");

const prisma = new PrismaClient();


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
        include: {
            participants: true,
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
            participants: {
                where: { id: { not: parseInt(userId) } },
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                },
            },
            group: true,
            messages: {
                take: 1,
                orderBy: { timeStamp: 'desc' },
            },
        },
    });

    const formattedChats = chats.map(chat => {
        const receiver = chat.participants[0];
        return {
            ...chat,
            receiver,
            lastMessage: chat.messages.length > 0 ? chat.messages[0].content : '',
            updatedAt: chat.messages.length > 0 ? chat.messages[0].timeStamp : null,
        };
    });

    return res.status(200).json({ message: 'Chats fetched successfully', chats: formattedChats });
});


const getChatById = asyncHandler(async (req, res) => {
    const { chatId } = req.params;


    const chat = await prisma.chat.findUnique({
        where: { id: parseInt(chatId) },
        include: {
            participants: true,
            group: true,
            messages: {
                take: 1,
                orderBy: { timeStamp: 'desc' },
            },
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
            imageUrl: imageUrl || null,
        },
    });

    return res.status(201).json({ message: 'Message added successfully', message });

});

const getChatMessages = asyncHandler(async (req, res) => {
    const chatId = parseInt(req.params.chatId, 10);
    if (isNaN(chatId)) {
        return res.status(400).json({ message: 'Invalid chatId' });
    }

    const take = parseInt(req.query.take, 10) || 20;
    const skip = parseInt(req.query.skip, 10) || 0;

    console.log(chatId);

    try {
        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId,
            },
            include: {
                messages: {
                    take,
                    skip,
                    orderBy: { timeStamp: 'asc' },
                },
            },
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        return res.status(200).json({
            message: 'Messages fetched successfully',
            messages: chat.messages,
        });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


const searchChats = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { query } = req.query;


    const chats = await prisma.chat.findMany({
        where: {
            participants: {
                some: {
                    OR: [
                        { username: { contains: query, mode: 'insensitive' } },
                        { displayName: { contains: query, mode: 'insensitive' } },
                    ],
                },
            },
        },
        include: {
            participants: true,
        },
    });

    return res.status(200).json({ message: 'Chats fetched successfully', chats });

});


module.exports = {
    createChat,
    getUserChats,
    getChatById,
    updateChat,
    deleteChat,
    addMessageToChat,
    getChatMessages,
    searchChats,
}





