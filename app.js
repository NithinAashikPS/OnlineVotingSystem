const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const localStorage = require('localStorage');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
    secret: 'VSP',
    saveUninitialized: true,
    resave: true
}));
app.use(flash());
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('login', {
        title: 'Login',
        type: 'user_signin'
    });
});

app.get('/admin', (req, res) => {
    res.render('admin_login', {
        title: 'Admin Login',
        type: 'admin_signin'
    });
});

app.get('/register', (req, res) => {
    res.render('register', {
        title: 'Register',
    });
});

app.get('/updateAccount/:type/:_id', (req, res) => {
    console.log(req.query);
    var headers = {
        Authorization: localStorage.getItem('Access-token')
    };
    request.patch('https://ovs-api.herokuapp.com/' + req.params.type + '/update/' + req.params._id, {
        json: req.query,
        headers: headers
    }, (error, result, body) => {
        console.log(body);
        if (body.message == "Failed" || body.message == "Authendication Failed") {
            res.redirect('/401');
        } else {
            localStorage.removeItem('Access-token');
            if (req.params.type == "admin") {
                res.redirect('/admin');
            } else {
                res.redirect('/');
            }
        }
    });
});

app.get('/addNewPosition', (req, res) => {
    console.log(req.query);
    var headers = {
        Authorization: localStorage.getItem('Access-token')
    };
    request.post('https://ovs-api.herokuapp.com/position/add', {
        json: req.query,
        headers: headers
    }, (error, result, body) => {
        console.log(body);
        if (body.message == "Failed" || body.message == "Authendication Failed") {
            res.redirect('/401');
        } else {
            res.redirect('/admin-home');
        }
    });
});

app.get('/deletePosition/:_id', (req, res) => {
    var headers = {
        Authorization: localStorage.getItem('Access-token')
    };
    request.delete('https://ovs-api.herokuapp.com/position/delete/' + req.params._id, {
        headers: headers
    }, (error, result, body) => {
        console.log(body);
        if (body.message == "Failed" || body.message == "Authendication Failed") {
            res.redirect('/401');
        } else {
            res.redirect('/admin-home');
        }
    });
});

app.get('/deleteCandidate/:_id', (req, res) => {
    var headers = {
        Authorization: localStorage.getItem('Access-token')
    };
    request.delete('https://ovs-api.herokuapp.com/candidate/delete/' + req.params._id, {
        headers: headers
    }, (error, result, body) => {
        console.log(body);
        if (body.message == "Failed" || body.message == "Authendication Failed") {
            res.redirect('/401');
        } else {
            res.redirect('/admin-home');
        }
    });
});

app.get('/addCandidate/:position/:name', (req, res) => {
    console.log(req.params.position);

    console.log(req.params.name);
    var headers = {
        Authorization: localStorage.getItem('Access-token')
    };
    request.post('https://ovs-api.herokuapp.com/candidate/add/' + req.params.position + '/' + req.params.name, {
        headers: headers
    }, (error, result, body) => {
        console.log(body);
        if (body.message == "Failed" || body.message == "Authendication Failed") {
            res.redirect('/401');
        } else {
            res.redirect('/admin-home');
        }
    });
});

app.get('/vote/:_id/:voter', (req, res) => {
    var headers = {
        Authorization: localStorage.getItem('Access-token')
    };
    console.log(req.params._id);
    request.patch('https://ovs-api.herokuapp.com/poll/vote/' + req.params._id + '/' + req.params.voter, {
        headers: headers
    }, (error, result, body) => {
        console.log(body);
        if (body.message == "Failed" || body.message == "Authendication Failed") {
            res.redirect('/401');
        } else {
            res.redirect('/user-home');
        }
    });
});

app.get('/forgot-password', (req, res) => {
    res.render('forgot-password', {
        title: 'Forgot Password',
        error_msg: req.flash('error_msg'),
        success_msg: req.flash('success_msg')
    });
});

app.get('/reset-password/:token/:type', (req, res) => {
    jwt.verify(req.params.token, 'VSP', (err, decoded) => {
        if (err) {
            res.render('404', {
                title: 'Page Not Found'
            });
        } else {
            console.log(decoded.email);
            res.render('reset', {
                title: 'Reset Password',
                email: decoded.email,
                type: req.params.type
            });
        }
    });
});

app.get('/admin_logout', (req, res) => {
    localStorage.removeItem('Access-token');
    res.redirect('/admin');
});

app.get('/user_logout', (req, res) => {
    localStorage.removeItem('Access-token');
    res.redirect('/');
})

app.get('/user-home', (req, res) => {
    var headers = {
        Authorization: localStorage.getItem('Access-token')
    };
    jwt.verify(localStorage.getItem('Access-token'), 'VSP', (err, decoded) => {
        if (err) {
            res.render('401', {
                title: 'User Not Signed In'
            });
        } else {
            request('https://ovs-api.herokuapp.com/poll/' + decoded.userId, { headers: headers }, (error, result, body2) => {
                var poll = JSON.parse(body2);
                if (poll.message == 'Failed' || poll.message == 'Authendication Failed') {
                    res.render('401', {
                        title: 'User Not Signed In'
                    });
                } else {
                    console.log(poll);
                    var str = decoded.name;
                    var matches = str.match(/\b(\w)/g);
                    var acronym = matches.join('');
                    res.render('user_home', {
                        title: 'User Home',
                        title2: 'user',
                        name: decoded.name,
                        email: decoded.email,
                        dp: acronym,
                        id: decoded.userId,
                        poll: poll
                    });
                }
            });
        }
    });
});

app.get('/admin-home', (req, res) => {
    var headers = {
        Authorization: localStorage.getItem('Access-token')
    };
    jwt.verify(localStorage.getItem('Access-token'), 'VSP', (err, decoded) => {
        if (err) {
            res.render('401', {
                title: 'Admin Not Signed In'
            });
        } else {
            request('https://ovs-api.herokuapp.com/position/', { headers: headers }, (error, result, body1) => {
                var position = JSON.parse(body1);
                if (position.message == 'Failed' || position.message == 'Authendication Failed') {
                    res.render('401', {
                        title: 'Admin Not Signed In'
                    });
                } else {
                    request('https://ovs-api.herokuapp.com/candidate/', { headers: headers }, (error, result, body2) => {
                        var candidate = JSON.parse(body2);
                        if (position.message == 'Failed' || position.message == 'Authendication Failed') {
                            res.render('401', {
                                title: 'Admin Not Signed In'
                            });
                        } else {
                            request('https://ovs-api.herokuapp.com/poll/' + decoded.userId, { headers: headers }, (error, result, body2) => {
                                var poll = JSON.parse(body2);
                                if (poll.message == 'Failed' || poll.message == 'Authendication Failed') {
                                    res.render('401', {
                                        title: 'Admin Not Signed In'
                                    });
                                } else {
                                    console.log(poll);
                                    var str = decoded.name;
                                    var matches = str.match(/\b(\w)/g);
                                    var acronym = matches.join('');
                                    res.render('admin_home', {
                                        title: 'Admin Home',
                                        title2: 'admin',
                                        name: decoded.name,
                                        email: decoded.email,
                                        dp: acronym,
                                        id: decoded.userId,
                                        poll: poll,
                                        position: position,
                                        candidate: candidate
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

app.get('/401', (req, res) => {
    res.render('401', {
        title: 'Authendication Failed'
    });
});

app.get('/admin_signin', (req, res) => {
    request.post('https://ovs-api.herokuapp.com/admin/signin', {
        json: req.query
    }, (error, result, body) => {
        console.log(body);
        if (body.message == "Authendication Failed") {
            res.redirect('/401');
        } else {
            localStorage.setItem('Access-token', body.token);
            res.redirect('/admin-home');
        }
    });
});

app.get('/user_signin', (req, res) => {
    request.post('https://ovs-api.herokuapp.com/user/signin', {
        json: req.query
    }, (error, result, body) => {
        console.log(body);
        if (body.message == "Authendication Failed") {
            res.redirect('/401');
        } else {
            localStorage.setItem('Access-token', body.token);
            res.redirect('/user-home');
        }
    });
});

app.get('/user_signup', (req, res) => {
    request.post('https://ovs-api.herokuapp.com/user/signup', {
        json: req.query
    }, (error, result, body) => {
        console.log(body);
        if (body.message == "Authendication Failed") {
            res.redirect('/401');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/changePassword/:email/:type', (req, res) => {
    request.patch('https://ovs-api.herokuapp.com/' + req.params.type + '/changePassword', {
        json: {
            email: req.params.email,
            password: req.query.password
        }
    }, (error, result, body) => {
        console.log(body);
        if (body.message == "Not Found") {
            req.flash('error_msg', 'User with this Email Not Found');
            res.redirect('/forgot-password');
        } else {
            if (req.params.type == "admin") {
                res.redirect('/admin');
            } else {
                res.redirect('/');
            }
        }
    });
});

app.get('/resetPassword/:type', (req, res) => {
    console.log(req.query.email);
    const token = jwt.sign({
        email: req.query.email
    }, 'VSP', {
        expiresIn: '1h'
    });
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        type: "SMTP",
        auth: {
            user: 'csandengineering@gmail.com',
            pass: 'lamborginisv'
        }
    });
    const mailOptions = {
        from: 'csandengineering@gmail.com',
        to: req.query.email,
        subject: 'OVS Reset Password',
        text: 'Click here to reset password : https://online-voting-system-vsp.herokuapp.com/reset-password/' + token + '/' + req.params.type
    };
    transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            console.log(err)
            req.flash('error_msg', 'Error sending email');
            res.redirect('/forgot-password');
        } else {
            console.log(data)
            req.flash('success_msg', 'Check your inbox');
            res.redirect('/forgot-password');
        }
    });
    console.log(token);
});

app.get('*', (req, res) => {
    res.render('404', {
        title: 'Page Not Found'
    });
});

const port = process.env.PORT || 4000;

app.listen(port);