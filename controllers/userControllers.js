const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiry = "1h";

const createUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body; // displayName entity in the User model was optional. Not needed to create an account.

    // Check if all required fields are provided
    if (!username || !email || !password) {
        res.status(400);
        throw new Error("All fields are required");
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        res.status(400);
        throw new Error("User already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in db with Prisma
    const user = await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
        },
    });

    res.status(201).json({ message: "User created successfully", user });
});


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body; // Chose to login the user based on email, not username

    // Check if both email and password are provided
    if (!email || !password) {
        res.status(400);
        throw new Error("Email and password are required");
    }

    // Find the user in db
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        res.status(401);
        throw new Error("Invalid credentials");
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        res.status(401);
        throw new Error("Invalid credentials");
    }

    // Generate a JWT
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: jwtExpiry });

    res.status(200).json({ message: "Login successful", token, user });
});


const logoutUser = asyncHandler(async (req, res) => {
    req.logout();
    res.status(200).json({ message: "User logged out successfully" });
});


const getUser = asyncHandler(async (req, res) => {
    
});

const getAllUsers = asyncHandler(async (req, res) => {

});

const updateUser = asyncHandler(async (req, res) => {
    
});

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Delete the user
    await prisma.user.delete({ where: { id: Number(id) } });

    res.status(200).json({ message: "User deleted successfully" });
});
