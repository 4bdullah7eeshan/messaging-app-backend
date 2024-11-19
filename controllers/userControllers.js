const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiry = "1h";

const createUser = asyncHandler(async (req, res) => {
    
});

const loginUser = asyncHandler(async (req, res) => {

});


const logoutUser = asyncHandler(async (req, res) => {

});

const getUser = asyncHandler(async (req, res) => {
    
});

const getAllUsers = asyncHandler(async (req, res) => {

});

const updateUser = asyncHandler(async (req, res) => {
    
});

const deleteUser = asyncHandler(async (req, res) => {
    
});