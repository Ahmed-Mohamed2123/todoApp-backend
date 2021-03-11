const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const _ = require('lodash');

exports.singup = async (req, res) => {
    await bcrypt.hash(req.body.password, 10)
        .then(async hash => {
            const user = new User({
                email: req.body.email,
                password: hash,
                role: 'admin'
            });
            await user.save()
            .then(result => {
                res.status(201).json({
                    message: 'User created!',
                    result: result
                });
            })
            .catch(err => {
                res.status(500).json({
                    message: 'Invalid authentication credentials!'
                })
            });

        })
};

exports.login = async (req, res) => {
    let feachedUser;
    await User.findOne({ email: req.body.email }).select('+password')
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    message: "User does not exist in the database"
                });
            }
            feachedUser = user;
            return bcrypt.compare(req.body.password, user.password);
        })
        .then(result => {
            if (!result) {
                return res.status(400).json({
                    message: 'Your password is incorrect, please enter another one'
                });
            }
            const accessToken = jwt.sign({
                email: feachedUser.email,
                userId: feachedUser._id,
                role: [feachedUser.role]
            }, process.env.SECRET_TOKEN, { expiresIn: "24h" });

            res.status(200).json({
                accessToken,
                expiresIn: '24h',
                userId: feachedUser._id,
                email: feachedUser.email
            })
        })
        .catch(() => {
            return res.status(401).json({
                message: "Invalid authentication credentials!"
            });
        })
};

exports.AllUser = async (req, res) => {
    return res.status(200).json({
        data: req.user
    });
};

// Configuration NodeMailer
let transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    // secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.myEmail, // generated ethereal user
      pass: process.env.myPass, // generated ethereal password
    }
});
exports.forgotPassword = async (req, res) => {
    const {email} = req.body;

    await User.findOne({email}, async (err, user) => {
        if (err || !user) {
            return res.status(404).json({
                error: 'User with this email does not exists'
            });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const data = {
            from: '"Fred Foo 👻" <ahmedshabana646@gmail.com>',
            to: email,
            subject: 'Account Activation Link',
            text: 'Hello world?',
            html: `
                <h2>Please click on given link to reset you password</h2>
                <p>http://localhost:4200/auth/reset-password/${resetToken}</p>
            `
        };

        try {
            await transporter.sendMail(data, (err, success) => {
                if (err) {
                    return res.json({
                        error: err.message
                    })
                } else {
                    res.status(200).json({
                        status: 'success',
                        message: 'Token sent to email!'
                    });
                }
            });
        } catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
        }
    })
};

exports.resetPassword = async (req, res) => {
    // Get user based on the token
    let hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // If token has not expired, and there is user, set the new password
    if (!user) {
        return res.status(400).json({
            message: 'Token is invalid or has expired!'
        })
    }

    await bcrypt.hash(req.body.password, 10).then(hash => {
        user.password = hash;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
    });
    await user.save();

    res.status(200).json({
        status: 'success'
    });
};
