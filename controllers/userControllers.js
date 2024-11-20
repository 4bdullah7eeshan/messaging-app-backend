const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiry = "1h";

const createUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body; // displayName entity in the User model was optional. Not needed to create an account.

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

    // Find the user in db
    const user = await prisma.user.findUnique({ where: { email } });

    // If the user does not exist in the db throw an error. 401 coz auth.
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If the passwords do not match, throw an error
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a JWT
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: jwtExpiry });

    res.status(200).json({ message: "Login successful", token, user });
});


const logoutUser = asyncHandler(async (req, res) => {
    // No need to search db, just check authentication. 401 coz auth.
    if (!req.user) {
        return res.status(401).json({ message: "User is not authenticated" });
    }

    req.logout();
    res.status(200).json({ message: "User logged out successfully" });
});


const getUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Fetch the user from db
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

    // If user does not exist in db return error
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
});


const getAllUsers = asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            // Todo: Get more properties based on requirement.
        },
    });

    res.status(200).json(users);
});


const updateUser = asyncHandler(async (req, res) => {
    // Think about this!
    // What to update? All entities such as DP/bio/display name/ or just one? How to manage both cases?
    // Create different controllers for each entity update?
    // Password changes? Username and email changes?
    // If username/email changes, then need to ensure uniqueness too
    const { id } = req.params;
    const { avatarUrl, bio, displayName } = req.body;

    // Fetch the user from the db
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

    // If the user does not exist, throw an error
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
            avatarUrl,
            bio,
            displayName,
        },
    });

    res.status(200).json({ message: "User updated successfully", updatedUser });

});


const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Fetch the user from the db
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

    // If the user does not exist, throw an error
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    await prisma.user.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: "User deleted successfully" });
});
