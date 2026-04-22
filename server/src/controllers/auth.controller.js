const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// REGISTER
exports.register = async (req, res) => {
    try {
        let { name, email, password } = req.body;

        // sanitize input
        name = name?.trim();
        email = email?.trim();
        password = password?.trim();

        // validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        // check existing user
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        // hash password (stronger)
        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
        });

    } catch (error) {
        console.error("Register error:", error.message);

        res.status(500).json({
            success: false,
            message: "Registration failed",
        });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;

        // sanitize input
        email = email?.trim();
        password = password?.trim();

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // ensure JWT secret exists
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET not defined in environment");
        }

        // generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
};