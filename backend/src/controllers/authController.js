import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '15d'
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        httpOnly: true,          // prevent XSS
        sameSite: isProd ? "none" : "strict", // "none" required for cross-domain in prod
        secure: isProd,          // must be true when sameSite=none
    });
};

export const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "Please fill in all fields" });
        }

        // Username rules: min 4 chars, must start with a letter or digit
        if (username.length < 4) {
            return res.status(400).json({ error: "Username must be at least 4 characters" });
        }
        if (!/^[a-zA-Z0-9]/.test(username)) {
            return res.status(400).json({ error: "Username must start with a letter or number" });
        }

        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            if (userExists.username === username) {
                return res.status(400).json({ error: "Username is already taken" });
            }
            return res.status(400).json({ error: "Email is already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, email, password: hashedPassword });

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Allow login with either username or email
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        generateTokenAndSetCookie(user._id, res);
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const logout = (req, res) => {
    try {
        const isProd = process.env.NODE_ENV === "production";
        res.cookie("jwt", "", {
            maxAge: 0,
            httpOnly: true,
            sameSite: isProd ? "none" : "strict",
            secure: isProd,
        });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        let profilePic = "";
        if (req.file) {
            profilePic = `/uploads/${req.file.filename}`;
        } else if (req.body.profilePic) {
            profilePic = req.body.profilePic;
        }

        if (!profilePic) {
            return res.status(400).json({ error: "No profile picture provided" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic },
            { new: true }
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in updateProfile controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const removeProfilePic = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { profilePic: "" },
            { new: true }
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in removeProfilePic controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateUsername = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }
        if (username.length < 4) {
            return res.status(400).json({ error: "Username must be at least 4 characters" });
        }
        if (!/^[a-zA-Z0-9]/.test(username)) {
            return res.status(400).json({ error: "Username must start with a letter or number" });
        }

        // Check uniqueness (exclude current user)
        const existing = await User.findOne({ username, _id: { $ne: req.user._id } });
        if (existing) {
            return res.status(400).json({ error: "Username is already taken" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { username },
            { new: true }
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in updateUsername controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        // Delete all user data: notes, notebooks, user record
        const Note = (await import('../models/Note.js')).default;
        const Notebook = (await import('../models/Notebook.js')).default;

        await Note.deleteMany({ userId });
        await Notebook.deleteMany({ userId });
        await User.findByIdAndDelete(userId);

        // Clear the auth cookie
        const isProd = process.env.NODE_ENV === "production";
        res.cookie("jwt", "", {
            maxAge: 0,
            httpOnly: true,
            sameSite: isProd ? "none" : "strict",
            secure: isProd,
        });

        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.log("Error in deleteAccount controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
