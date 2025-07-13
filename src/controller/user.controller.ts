import User from "../model/user.model";
import { Request, Response } from "express";
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import type { TransportOptions } from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const registerUser = async (req: Request, res: Response) => {
    const { firstName, lastName, email, username, password } = req.body;
    console.log(req.body)
    if (!firstName || !email || !username || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        })
    }

    try {
        const userByEmail = await User.findOne({ email });
        if (userByEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            })
        }


        const userById = await User.findOne({ username });
        if (userById) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            })
        }

        const newUser = await User.create({ firstName, lastName, email, username, password })
        console.log(newUser, "newUser")
        const token = crypto.randomBytes(64).toString('hex');
        newUser.verificationToken = token;
        await newUser.save();

        //mail
        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: Number(process.env.MAILTRAP_PORT),
            secure: false,
            auth: {
                user: process.env.MAILTRAP_USERNAME,
                pass: process.env.MAILTRAP_PASSWORD,
            },
        } as TransportOptions);

        const mailOptions = {
            from: process.env.MAILTRAP_SENDER_EMAIL,
            to: newUser.email,
            subject: 'Verify your email',
            text: `Please click in the following link to verify your email: ${process.env.BASE_URL}/api/v1/user/verify/${token}`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: newUser
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}


const verifyUser = async (req: Request, res: Response) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid token'
            })
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'User verified successfully'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

const generateApiKey = async (req: Request, res: Response) => {
    const username = req.params.username;

    if (!username) {
        return res.status(400).json({
            success: false,
            message: 'Username is required',
        });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const apiKey = uuidv4();
        user.apiKey = apiKey;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'API key generated successfully',
            apiKey,
        });
    } catch (error) {
        console.error('Error generating API key:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        })
    }
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            })
        }

        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'User is not verified'
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            })
        }


        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET as string,
            {
                expiresIn: '1d',
            }
        );

        const apiKey = uuidv4();
        user.apiKey = apiKey;
        await user.save();

        const apikey = jwt.sign(
            { apiKey: apiKey },
            process.env.JWT_SECRET as string,
            {
                expiresIn: '7d',
            }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 1 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            token,
            user: {
                id: user._id,
                name: user.firstName + ' ' + user.lastName,
                email: user.email,
                role: user.role,
                apiKey: user.apiKey
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

const getProfile = async (req: Request, res: Response) => {
    try {
        const id = res.locals.userData.id;
        const user = await User.findById(id).select('-password -apiKey');
        console.log('user', user);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        res.status(200).json({
            success: true,
            message: 'User found',
            user,
        });
    } catch (error) {
        res
            .status(500)
            .json({ success: false, message: 'Internal Server Error', error });
    }
}

const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: '15m' }
        );

        user.passwordResetToken = token;
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: Number(process.env.MAILTRAP_PORT),
            secure: false,
            auth: {
                user: process.env.MAILTRAP_USERNAME,
                pass: process.env.MAILTRAP_PASSWORD,
            },
        } as TransportOptions);

        // Email options
        const mailOptions = {
            from: process.env.MAILTRAP_SENDER_EMAIL,
            to: user.email,
            subject: 'Reset Password',
            text: `Please click the following link to reset your password: ${process.env.BASE_URL}/api/v1/user/reset-password/${token}`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: 'Password reset email sent successfully'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error
        });
    }
};

const resetPassword = async (req: Request, res: Response) => {

    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
        return res.status(400).json({
            success: false,
            message: "Token and password are required"
        });
    }

    try {
        const user = await User.findOne({ passwordResetToken: token });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid token"
            });
        }

        if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Token has expired"
            });
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error
        });
    }
}


export { registerUser, verifyUser, generateApiKey, login, getProfile, forgotPassword, resetPassword }
