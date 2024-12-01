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




