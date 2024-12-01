const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");



const cloudinary = require("../config/cloudinary");

const storage = multer.memoryStorage();


const upload = multer({ storage: storage });


const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiry = "1h";

const createUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body; // displayName entity in the User model was optional. Not needed to create an account.

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ message: "Email is already in use" });
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
    try {
        const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: jwtExpiry });
        res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
        return res.status(500).json({ message: "Error generating token", error });
    }


});


const logoutUser = asyncHandler(async (req, res) => {
    // No need to search db, just check authentication. 401 coz auth.
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "User is not authenticated" });
    }

    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: "Logout failed", error: err });
        }
        res.status(200).json({ message: "User logged out successfully" });
    });
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

const getLoggedInUser = asyncHandler(async (req, res) => {
    const userId = req.user.userId; // Extract userId from req.user
    console.log(req);
    console.log(req.user);
    console.log(userId);

    const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: { // Select only the fields you want to expose
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            bio: true,
        }
    });

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
            displayName: true,
            email: true,
            avatarUrl: true,
            bio: true,
            isOnline: true,
            lastActive: true,
            createdAt: true,
            
        },
    });

    res.status(200).json(users);
});


// const updateUser = asyncHandler(async (req, res) => {
//     // Think about this!
//     // What to update? All entities such as DP/bio/display name/ or just one? How to manage both cases?
//     // Create different controllers for each entity update?
//     // Password changes? Username and email changes?
//     // If username/email changes, then need to ensure uniqueness too
//     const { id } = req.params;
//     const { bio, displayName } = req.body;  // Parse the updated data
//     let avatarUrl = null;

//     if (req.file) {
//         const uploadResult = await cloudinary.uploader.upload(req.file.path, {
//             folder: "uploads", resource_type: "auto"
//         });
//         avatarUrl = uploadResult.secure_url;
//     }

//     // Fetch the user from the db
//     const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

//     // If the user does not exist, throw an error
//     if (!user) {
//         return res.status(404).json({ message: "User not found" });
//     }

//     console.log(user);  // Add this line to check if the user is found

//     console.log(bio);

//     console.log(displayName);
//     const updatedUser = await prisma.user.update({
//         where: { id: parseInt(id) },
//         data: {
//             avatarUrl: avatarUrl || user.avatarUrl,
//             bio: bio || user.bio,
//             displayName: displayName || user.displayName,
//         },
//     });

//     console.log(user);  // Add this line to check if the user is found


//     res.status(200).json({ message: "User updated successfully", updatedUser });

// });

const updateTextualData = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { bio, displayName } = req.body;

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }


    const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
            bio: bio || user.bio,
            displayName: displayName || user.displayName,
        },
    });


    res.status(200).json({ message: "User textual data updated successfully", updatedUser });
});

const updateAvatar = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: "uploads", resource_type: "auto" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        ).end(req.file.buffer);
    });

    const avatarUrl = uploadResult.secure_url;

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
            avatarUrl: avatarUrl,
        },
    });


    res.status(200).json({ message: "User avatar updated successfully", updatedUser });
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

module.exports = {
    createUser,
    loginUser,
    logoutUser,
    getUser,
    getAllUsers,
    updateTextualData,
    updateAvatar,
    deleteUser,
    getLoggedInUser,
    upload,
}
