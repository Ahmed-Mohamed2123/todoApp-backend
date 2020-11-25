const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const _ = require('lodash');

exports.singup = async (req, res) => {
    await bcrypt.hash(req.body.password, 10)
        .then(async hash => {
            const user = new User({
                email: req.body.email,
                password: hash
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
    await User.findOne({ email: req.body.email })
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
                    message: 'Your password is inccorrect, please enter another one'
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

// Configration NodeMailer
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'ahmedshabana646@gmail.com', // generated ethereal user
      pass: 'Aa6801796@', // generated ethereal password
    },
    tls: {
        rejectUnauthorized: false,
    },
});
exports.forgotPassword = async (req, res) => {
    const {email} = req.body;

    await User.findOne({email}, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User with this email does not exists'
            });
        }

        const token = jwt.sign({_id: user._id}, process.env.SECRET_TOKEN, {expiresIn: '20m'});
        const data = {
            from: '"Fred Foo 👻" <ahmedshabana646@gmail.com>',
            to: email,
            subject: 'Account Activation Link',
            text: 'Hello world?',
            html: `
                <h2>Please click on given link to reset you password</h2>
                <p>http://localhost:4200/auth/reset-password/${token}</p>
            `
        };

        return user.updateOne({resetLink: token}, (err, success) => {
            if (err) {
                return res.status(400).json({
                    error: 'reset password link error'
                });
            } else {
                transporter.sendMail(data, (err, success) => {
                    if (err) {
                        return res.json({
                            error: err.message
                        })
                    }
                    return res.json({
                        message: 'Email has been sent, kindly follow the instructions'
                    });
                });
            }
        })
    })
};

exports.resetPassword = async (req, res) => {
    const {resetLink, newPass} = req.body;
    if (resetLink) {
        jwt.verify(resetLink, process.env.SECRET_TOKEN, async (err, decodedData) => {
            if (err) {
                return res.status(401).json({
                    error: 'Incorrect token or it is expired'
                });
            }

            await User.findOne({resetLink}, async (err, user) => {
                if (err || !user) {
                    return res.status(400).json({
                        error: 'User with this token does not exists'
                    });
                }
                
                await bcrypt.hash(newPass, 10)
                    .then(hash => {
                        const obj = {
                            password: hash,
                            resetLink: ''
                        }
                        
                        user = _.extend(user, obj);
                        user.save((err, result) => {
                            if (err) {
                                return res.status(400).json({
                                    error: 'reset password error'
                                });
                            } else {
                                return res.status(200).json({
                                    message: 'Your password has bean changed'
                                });
                            }
                        });
                    })
                
            })
        })
    } else {
        return res.status(401).json({
            error: 'Authentication error!'
        });
    }
};