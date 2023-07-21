const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var fs = require('fs');
var path = require('path');




var multer = require('multer');
const nodemailer = require('nodemailer');
const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function generateString(length) {
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now());
    },
});
var upload = multer({ storage: storage });

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://127.0.0.1:27017/stundentengagementsystem', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

var imageSchema = new mongoose.Schema({
    fname: String,
    img: {
        data: Buffer,
        contentType: String,
    },
});
const imgModel = new mongoose.model('Image', imageSchema);
const userschema = new mongoose.Schema({
    username: String,
    password: String,
    status: Number,
});
const administrator = new mongoose.Schema({
    firstname: String,
    lastname: String,
    phonenumber: String,
    username: String,
    gender: String,
    dob: String,
    adminid: String,
});

const student = new mongoose.Schema({
    firstname: String,
    lastname: String,
    phonenumber: String,
    username: String,
    password: String,
    gender: String,
    studentid: String,
    dob: String,
    semester: Number,
    department: String,
});

const teacher = new mongoose.Schema({
    firstname: String,
    lastname: String,
    phonenumber: String,
    username: String,
    password: String,
    gender: String,
    teacherid: String,
    dob: String,
    department: String,
});
const admincounter = new mongoose.Schema({
    _id: String,
    sequence_value: Number,
});
const studentcounter = new mongoose.Schema({
    _id: String,
    sequence_value: Number,
});
const teachercounter = new mongoose.Schema({
    _id: String,
    sequence_value: Number,
});
const filecounter = new mongoose.Schema({
    _id: String,
    sequence_value: Number,
});
const subject_teacher_mapping = new mongoose.Schema({
    _id: { teacherid: { type: String }, subjectid: { type: String } },
    teacherid: String,
    subjectid: String,
});
const subject_student_mapping = new mongoose.Schema({
    _id: { studentid: { type: String }, subjectid: { type: String } },
    studentid: String,
    subjectid: String,
});
const uploadfile = new mongoose.Schema({
    filecode: String,
    file: Buffer
})
var submission = new mongoose.Schema({
    studentid: String,
    evaluated: Boolean,
    marks: Number,
    answer_file_code: String
})
var assignments = new mongoose.Schema({
    assignment_file_code: String,
    assignment_name: String,
    assignment_description: String,
    submissions: [submission]
})
const subject = new mongoose.Schema({
    _id: String,
    subjectname: String,
    department: String,
    semester: Number,
    assignments: [assignments],
    credits: Number
});
userschema.plugin(passportLocalMongoose);
const User = new mongoose.model('User', userschema);
const Admin = new mongoose.model('Admin', administrator);
const Admincounter = new mongoose.model('Admincounter', admincounter);
const Teachercounter = new mongoose.model('Teachercounter', teachercounter);
const Studentcounter = new mongoose.model('Studentcounter', studentcounter);
const Filecounter = new mongoose.model('Filecounter', filecounter);
const Teacher = new mongoose.model('Teacher', teacher);
const Student = new mongoose.model('Student', student);
const Subject = new mongoose.model('Subject', subject);
const Uploadfile = new mongoose.model('Uploadfile', uploadfile);
const Submissions = new mongoose.model('Submissions', submission);
const Assignments = new mongoose.model('Assignments', assignments);
const Subjects = new mongoose.model('Subjects', subject);
const Subject_teacher_mapping = new mongoose.model(
    'Subject_teacher_mapping',
    subject_teacher_mapping
);

const Subject_student_mapping = new mongoose.model(
    'Subject_student_mapping',
    subject_student_mapping
);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function getNextSequenceValues(sequenceName) {
    return Admincounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { new: true }
    ).exec();
}

function getNextSequenceValuesforstudents(sequenceName) {
    return Studentcounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { new: true }
    ).exec();
}
function getNextSequenceValuesforteachers(sequenceName) {
    return Teachercounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { new: true }
    ).exec();
}
function getNextSequenceValuesforfiles(sequenceName) {
    return Filecounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { new: true }
    ).exec();
}
function createadminid() {
    h = getNextSequenceValues('adminid').then((p) => {
        h = p.sequence_value;
        return h;
    });
    return h;
}
function createteacherid() {
    h = getNextSequenceValuesforteachers('teacherid').then((p) => {
        h = p.sequence_value;
        return h;
    });
    return h;
}
function createstudentid() {
    h = getNextSequenceValuesforstudents('studentid').then((p) => {
        h = p.sequence_value;
        return h;
    });
    return h;
}
function createfileid() {
    h = getNextSequenceValuesforfiles('fileid').then((p) => {
        h = p.sequence_value;
        return h;
    });
    return h;
}

Studentcounter.create({
    _id: 'studentid',
    sequence_value: 0,
}).catch((err) => { });
Admincounter.create({ _id: 'adminid', sequence_value: 0 }).catch((err) => { });
Teachercounter.create({
    _id: 'teacherid',
    sequence_value: 0,
}).catch((err) => { });
Filecounter.create({
    _id: 'fileid',
    sequence_value: 0,
}).catch((err) => { });


app.get('/', function (req, res) {
    res.render('landingpage', { err: '' });
});
app.get('/index', function (req, res) {
    res.render('index', { err: '' });
});
app.get('/register', function (req, res) {
    res.render('register');
});




app.get('/forgotpassword', function (req, res) {
    res.render('exception_handlingpage', { mes: "" });
});

app.get('/admin/change_password', function (req, res) {
    res.render('change_password');
});
app.get('/student/change_password', function (req, res) {
    res.render('studentChangePassword');
});
app.get('/teacher/change_password', function (req, res) {
    res.render('teacherChangePassword');
});

app.get('/admin/newStudent', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid }).exec().then(user => {
            if (user.status == 1) {
                res.render("newStudent")
            }
        })
    }
    else {
        res.redirect("/")
    }
});
app.get('/admin/newTeacher', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid }).exec().then(user => {
            if (user.status == 1) {
                res.render("newTeacher")
            }
        })
    }
    else {
        res.redirect("/")
    }
});

app.get('/uploadimage', (req, res) => {
    console.log(req.session.uniqueid);
    imgModel.find({ _id: req.session.uniqueid }, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        } else {
            res.render('uploadimage', { items: items });
        }
    });
});

function sendmail(p1, currmail) {
    var body = "SEA login password for your email id:" + currmail + " is " + p1;
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'krishnavarun307@gmail.com',
            pass: 'krishna@307',
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    let mailOptions = {
        from: 'krishnavarun307@gmail.com',
        to: currmail,
        subject: 'Password for SEA Login',
        text: body,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
}
app.post('/register', function (req, res) {
    var newid = new mongoose.mongo.ObjectId();

    pass = req.body.password
    console.log(pass);
    console.log(typeof pass);
    User.register(
        {
            username: req.body.email,
            status: Number(req.body.status),
            _id: newid,
        },
        pass,
        function (err) {
            if (err) {
                console.log(err);
                if (req.body.status == "1") {
                    res.redirect('/register');
                }
                else {
                    res.redirect("/admin/newStudent")
                }
            } else {
                console.log('registered');
                if (Number(req.body.status == 1)) {
                    createadminid().then((a) => {
                        trial = 'ADMIN' + String(a).padStart(3, '0');
                        Admin.create(
                            {
                                _id: newid,
                                adminid: trial,
                                firstname: req.body.fname,
                                lastname: req.body.lname,
                                username: req.body.email,
                                gender: req.body.gender,
                                phonenumber: req.body.number,
                                dob: req.body.dob,
                                
                            },
                            function (err, ctd) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    imgModel.create({
                                        _id: ctd._id,
                                        fname: 'd',
                                        img: {
                                            data: fs.readFileSync(
                                                path.join(
                                                    __dirname + '/uploads/' + 'image-1617718343531'
                                                )
                                            ),
                                            contentType: 'image/png',
                                        },
                                    });
                                    sendmail(pass, req.body.email)
                                    res.redirect('/index');
                                }
                            }
                        );
                    });
                } else if (Number(req.body.status) == 2) {
                    createteacherid().then((a) => {
                        trial = 'T' + String(a).padStart(3, '0');
                        Teacher.create(
                            {
                                _id: newid,
                                teacherid: trial,
                                department: req.body.dept,
                                firstname: req.body.fname,
                                lastname: req.body.lname,
                                username: req.body.email,
                                phonenumber: req.body.number,
                                gender: req.body.gender,
                                dob: req.body.dob,
                            },
                            function (err, ctd) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    imgModel.create({
                                        _id: ctd._id,
                                        fname: 'd',
                                        img: {
                                            data: fs.readFileSync(
                                                path.join(
                                                    __dirname + '/uploads/' + 'image-1617718343531'
                                                )
                                            ),
                                            contentType: 'image/png',
                                        },
                                    });
                                    sendmail(pass, req.body.email)
                                    res.redirect('/admin/newTeacher');
                                }
                            }
                        );
                    });
                } else if (Number(req.body.status) == 3) {
                    createstudentid().then((a) => {
                        console.log(String(a).padStart(3, '0'));
                        trial = 'S' + String(a).padStart(3, '0');
                        console.log(trial);
                        Student.create(
                            {
                                _id: newid,
                                studentid: trial,
                                firstname: req.body.fname,
                                semester: req.body.semester,
                                department: req.body.dept,
                                lastname: req.body.lname,
                                username: req.body.email,
                                gender: req.body.gender,
                                phonenumber: req.body.number,
                                dob: req.body.dob,
                            },
                            function (err, ctd) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    imgModel.create({
                                        _id: ctd._id,
                                        fname: 'd',
                                        img: {
                                            data: fs.readFileSync(
                                                path.join(
                                                    __dirname + '/uploads/' + 'image-1617718343531'
                                                )
                                            ),
                                            contentType: 'image/png',
                                        },
                                    });
                                    sendmail(pass, req.body.email)
                                    res.redirect('/admin/newStudent');
                                }
                            }
                        );
                    });
                }
            }
        }
    );
});

app.post('/forgotpassword', function (req, res) {
    const uname = req.body.username;
    pass = generateString(8)
    sendmail(pass, req.body.username)
    User.findByUsername(uname).then(function (su) {
        if (su) {
            su.setPassword(pass, function () {

                su.save();

                res.redirect('/forgotpassword', { mes: " New  Password sent to registered emailid ! " });
            });
        }
        else {
            console.log("hey");
            res.render('exception_handlingpage', { mes: "User does not exist" })
        }
    }).catch(err => {

    });
});

app.post('/subjectregister', function (req, res) {
    if (req.isAuthenticated()) {
        Subject.create({
            subjectname: req.body.sname,
            _id: req.body.scode,
            department: req.body.dept,
            semester: req.body.sem,
        })
            .then(function (done) {
                if (done) {
                    res.redirect('/admin/addsubject');
                }
            })
            .catch(function (err) {
                res.redirect('/admin/addsubject');
            });
    }
});

app.post('/login', function (req, res) {
    console.log(req.body);
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });
    req.login(user, function (err) {
        if (err) {
            console.log(err);
            res.redirect('/index');
        } else {
            passport.authenticate('local', { failureRedirect: '/errorlogin' })(
                req,
                res,
                function () {
                    User.findOne({ username: req.body.username })
                        .then((users) => {
                            req.session.uniqueid = users._id;
                            if (Number(users.status) == 1) {
                                res.redirect('/admin');
                            }
                            if (Number(users.status) == 2) {
                                res.redirect('/teacherHomePage');
                            }
                            if (Number(users.status) == 3) {
                                res.redirect('/studentHomePage');
                            }
                        })
                        .catch((e) => {
                            res.redirect('/login');
                            console.log(e);
                        });
                }
            );
        }
    });
});

app.get('/errorlogin', function (req, res) {
    res.render('index', { err: 'WRONG USERNAME OR PASSWORD' });
});
app.get('/admin', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    counts = [];
                    Teacher.estimatedDocumentCount()
                        .exec()
                        .then((ans) => {
                            counts.push(ans);
                            Student.estimatedDocumentCount()
                                .exec()
                                .then((sc) => {
                                    counts.push(sc);
                                    Subject.estimatedDocumentCount()
                                        .exec()
                                        .then((subc) => {
                                            counts.push(subc);
                                            res.render('admin', { counts: counts });
                                        });
                                });
                        });
                }
            });
    } else {
        res.redirect('/index');
    }
});

app.get('/admin/TeacherProfiles', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    Teacher.find(
                        {},
                        { firstname: 1, lastname: 1, department: 1, teacherid: 1 }
                    )
                        .exec()
                        .then((tlist) => {
                            teacherlist = tlist;
                            res.render('teacherlist_adminview', { students: tlist });
                        });
                }
            });
    } else {
        res.redirect('/index');
    }
});
app.post('/admin/teachersassigned/:sid', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    Subject_teacher_mapping.find({ subjectid: req.params.sid })
                        .exec()
                        .then((list) => {
                            for (var i = 0; i < list.length; i++) {
                                list[i] = list[i].teacherid;
                            }
                            Teacher.find(
                                { teacherid: { $in: list } },
                                { firstname: 1, lastname: 1, department: 1, teacherid: 1 }
                            )
                                .exec()
                                .then((tlist) => {
                                    teacherlist = tlist;
                                    res.render('teachersassignedlist', { students: tlist });
                                });
                        });
                }
            });
    } else {
        res.redirect('/index');
    }
});
app.post('/admin/studentsenrolled/:sid', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    Subject_student_mapping.find({ subjectid: req.params.sid })
                        .exec()
                        .then((list) => {
                            console.log(list);
                            for (var i = 0; i < list.length; i++) {
                                list[i] = list[i].studentid;
                            }
                            console.log(list);
                            Student.find(
                                { studentid: { $in: list } },
                                {
                                    firstname: 1,
                                    lastname: 1,
                                    department: 1,
                                    studentid: 1,
                                    semester: 1,
                                }
                            )
                                .exec()
                                .then((tlist) => {
                                    console.log(tlist);
                                    teacherlist = tlist;
                                    res.render('studentsenrolledlist', { students: tlist });
                                });

                        });
                }
            });
    } else {
        res.redirect('/index');
    }
});
app.get('/admin/StudentProfiles', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    Student.find(
                        {},
                        {
                            firstname: 1,
                            lastname: 1,
                            department: 1,
                            studentid: 1,
                            semester: 1,
                        }
                    )
                        .exec()
                        .then((slist) => {
                            studentlist = slist;

                            res.render('studentlist_adminview', { students: slist });
                        });
                }
            });
    } else {
        res.redirect('/index');
    }
});
app.get('/admin/viewsubjects', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    Subject.find(
                        {},
                        { subjectname: 1, department: 1, subjectid: 1, semester: 1 }
                    )
                        .exec()
                        .then((sublist) => {
                            studentlist = sublist;
                            res.render('subjectlist_adminview', { subject: sublist });
                        });
                }
            });
    }
});
app.post('/viewsubjects/subjectdetial/:scode', function (req, res) {
    if (req.isAuthenticated()) {
        var scode = req.params.scode;
        Subject.findOne({ _id: scode })
            .exec()
            .then((sub) => {

                res.render('subjectprofile', { detail: [sub] });
            });
    }
});

app.get('/admin/assignsubjects', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    Teacher.find({}, { firstname: 1, lastname: 1, teacherid: 1 })
                        .exec()
                        .then((tlist) => {
                            teacherlist = tlist;
                            Subject.find({}, { subjectname: 1, _id: 1 })
                                .exec()
                                .then((sublist) => {
                                    subjectlist = sublist;
                                    res.render('assignsubjects', {
                                        subject: sublist,
                                        teacher: tlist,
                                    });
                                });
                        });
                }
            });
    } else {
        res.redirect('/index');
    }
});

app.get('/teacherlogin', function (req, res) {
    console.log(req.session.uniqueid);
    if (req.isAuthenticated()) {
        res.send('Tsuccess');
    } else {
        res.redirect('/index');
    }
});

app.get('/admin/addsubject', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an admin');
                } else {
                    res.render('registersubjects');
                }
            });
    }
});
app.post("/changepassword", function (req, res) {
    console.log(req.body)
    User.findOne({ _id: req.session.uniqueid }).then(user => {
        user.changePassword(req.body.oldpassword, req.body.newpassword).then(p => {
            if (user.status == 1) {
                res.redirect("/admin")
            }
            else if (user.status == 2) {
                res.redirect("/teacherHomePage")
            }
            else {
                res.redirect("/studentHomePage")
            }

        })
    })
})

app.get('/studentHomePage', function (req, res) {
    if (req.isAuthenticated()) {
        console.log(req.session.uniqueid);
        Student.findOne({ _id: req.session.uniqueid }, { studentid: 1 })
            .exec()
            .then((stud) => {
                Subject_student_mapping.find({ studentid: stud.studentid })
                    .exec()
                    .then((ans) => {
                        subsenrolled = [];
                        for (var i = 0; i < ans.length; i++) {
                            subsenrolled.push(ans[i].subjectid);
                        }

                        Subject.find({ _id: { $in: subsenrolled } })
                            .exec()
                            .then((ans2) => {
                                colNotifs = [
                                    {
                                        message:
                                            'College fest starts from 7th march along with shhf;adjfaldjfha;jdhfajsdfh',
                                    },
                                ];
                                teacherNotifs = [
                                    {
                                        message: 'Assignment postponed to adhfhaljfdhsl;ajfdsha',
                                    },
                                ];
                                res.render('studentHomePage', {
                                    subject: ans2,
                                    colNotif: colNotifs,
                                    teacherNotifs: teacherNotifs,
                                });
                            });
                    });
            });
    } else {
        res.redirect('/index');
    }
});
app.get('/teacherHomePage', function (req, res) {
    if (req.isAuthenticated()) {

        Teacher.findOne({ _id: req.session.uniqueid }, { teacherid: 1 })
            .exec()
            .then((teach) => {
                Subject_teacher_mapping.find({ teacherid: teach.teacherid })
                    .exec()
                    .then((ans) => {
                        subsassigned = [];
                        for (var i = 0; i < ans.length; i++) {
                            subsassigned.push(ans[i].subjectid);
                        }

                        Subject.find({ _id: { $in: subsassigned } })
                            .exec()
                            .then((ans2) => {

                                colNotifs = [
                                    {
                                        message:
                                            'College fest starts from 7th march along with shhf;adjfaldjfha;jdhfajsdfh',
                                    },
                                ];
                                teacherNotifs = [
                                    {
                                        message: 'Assignment postponed to adhfhaljfdhsl;ajfdsha',
                                    },
                                ];
                                res.render('teacherHomePage', {
                                    subject: ans2,
                                    colNotif: colNotifs,
                                    teacherNotifs: teacherNotifs,
                                });
                            });
                    });
            });
    } else {
        res.redirect('/index');
    }
});

app.get('/testroute2', function (req, res) {
    console.log(req.body);
});
app.post('/testroute2', function (req, res) {
    console.log(req.body);
});
app.post('/assignsubjects', function (req, res) {
    console.log(req.body);
    Subject_teacher_mapping.create({
        _id: { teacherid: req.body.tid, subjectid: req.body.scode },
        teacherid: req.body.tid,
        subjectid: req.body.scode,
    })
        .then(res.redirect('/admin/assignsubjects'))
        .catch((err) => {
            console.log(err);
        });
});

app.post('/enrollsubject', function (req, res) {
    Subject_student_mapping.create({
        _id: { studentid: req.body.studid, subjectid: req.body.subcode },
        studentid: req.body.studid,
        subjectid: req.body.subcode,
    });
    res.redirect("/enrollsubject")
});

app.get('/enrollsubject', function (req, res) {
    Student.findOne({ _id: req.session.uniqueid }, { semester: 1, studentid: 1, department: 1 })
        .exec()
        .then((sem) => {
            Subject.find({ semester: sem.semester, department: sem.department }, {})
                .exec()
                .then((subjects) => {
                    Subject_student_mapping.find({ studentid: sem.studentid }, { subjectid: 1 }).then(subs => {
                        arrA = []
                        arrB = []
                        for (var i = 0; i < subjects.length; i++) {
                            arrA.push(subjects[i]._id)
                        }
                        for (var i = 0; i < subs.length; i++) {
                            arrB.push(subs[i].subjectid)
                        }
                        let difference = arrA.filter(x => !arrB.includes(x));
                        final = []
                        console.log(difference)
                        console.log(subjects)
                        for (var i = 0; i < difference.length; i++) {
                            for (var j = 0; j < subjects.length; j++) {
                                if (difference[i] == subjects[j]._id) {
                                    final.push(subjects[j])
                                }
                            }

                        }
                        res.render('subjectenroll', {
                            subject: final,
                            studid: sem.studentid,
                        });
                    })
                });
        });
});
app.post('/uploadimage', upload.single('image'), (req, res) => {
    imgModel.findOne({ _id: req.session.uniqueid }).then((a) => {
        var imgname = a.fname;
        console.log(imgname);
        console.log(imgname.length);
        if (imgname.length < 3) {
            console.log('reacher till here');
            console.log(req.file);
            imgModel
                .findOneAndUpdate(
                    { _id: req.session.uniqueid },
                    {
                        fname: req.file.filename,
                        img: {
                            data: fs.readFileSync(
                                path.join(__dirname + '/uploads/' + req.file.filename)
                            ),
                            contentType: 'image/png',
                        },
                    }
                )
                .then((p) => {
                    User.findOne({ _id: req.session.uniqueid }).then((use) => {
                        console.log(use);
                        if (use.status == 1) {
                            console.log('Aaaa');
                            console.log(use);
                            res.redirect('/admin/userProfile');
                        } else if (use.status == 2) {
                            res.redirect('/teacher/userProfile');
                        } else if (use.status == 3) {
                            res.redirect('/student/userProfile');
                        }
                    });
                });
        } else {
            console.log('reacher here');
            console.log(imgname);
            fs.unlinkSync(__dirname + '/uploads' + '/' + imgname);
            console.log(a);
            imgModel
                .findOneAndUpdate(
                    { _id: req.session.uniqueid },
                    {
                        fname: req.file.filename,
                        img: {
                            data: fs.readFileSync(
                                path.join(__dirname + '/uploads/' + req.file.filename)
                            ),
                            contentType: 'image/png',
                        },
                    }
                )
                .then((v) => {
                    User.findOne({ _id: req.session.uniqueid }).then((use) => {
                        console.log(use);
                        if (use.status == 1) {
                            console.log('Aaaa');
                            console.log(use);
                            res.redirect('/admin/userProfile');
                        } else if (use.status == 2) {
                            res.redirect('/teacher/userProfile');
                        } else if (use.status == 3) {
                            res.redirect('/student/userProfile');
                        }
                    });
                    console.log(v);
                })
                .catch((cat) => {
                    console.log(cat);
                });
        }
    });
});
app.get('/admin/userProfile', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    Admin.findOne(
                        { _id: req.session.uniqueid },
                        { firstname: 1, lastname: 1, gender: 1, dob: 1, adminid: 1, phonenumber: 1 }
                    )
                        .exec()
                        .then((arr) => {
                            ar = [arr];
                            imgModel
                                .findOne({ _id: req.session.uniqueid })
                                .exec()
                                .then((mg) => {
                                    res.render('userProfile', { detail: ar, image: mg });
                                });
                        });
                }
            });
    } else {
        res.redirect('/index');
    }
});
app.post('/admin/viewdetails/student/:sid', function (req, res) {
    if (req.isAuthenticated()) {
        Student.findOne(
            { studentid: req.params.sid },
            { firstname: 1, lastname: 1, gender: 1, dob: 1, studentid: 1, phonenumber: 1, username: 1 }
        )
            .exec()
            .then((arr) => {
                ar = [arr];
                Student.findOne({ studentid: req.params.sid }, { _id: 1 }).then(stud => {
                    imgModel.findOne({ _id: stud._id }).then(img => {
                        res.render('viewdetailsstudent', { detail: ar, image: img });
                    })
                })

            });
    } else {
        res.redirect('/index');
    }
});
app.post('/admin/viewdetails/teacher/:tid', function (req, res) {
    if (req.isAuthenticated()) {
        Teacher.findOne(
            { teacherid: req.params.tid },
            { firstname: 1, lastname: 1, gender: 1, dob: 1, teacherid: 1, username: 1 }
        )
            .exec()
            .then((arr) => {
                ar = [arr];
                console.log(ar)
                Teacher.findOne({ teacherid: req.params.tid }, { _id: 1 }).then(teach => {
                    imgModel.findOne({ _id: teach._id }).then(img => {
                        res.render('viewdetailsteacher', { detail: ar, image: img });
                    })
                })
            });
    } else {
        res.redirect('/index');
    }
});
app.get('/admin/editUserProfile', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    Admin.findOne(
                        { _id: req.session.uniqueid },
                        { firstname: 1, lastname: 1, gender: 1, dob: 1, adminid: 1, phonenumber: 1 }
                    )
                        .exec()
                        .then((arr) => {
                            ar = [arr];
                            imgModel
                                .findOne({ _id: req.session.uniqueid })
                                .exec()
                                .then((mg) => {
                                    res.render('editUserProfile', { student: ar, image: mg });
                                });
                        });
                }
            });
    } else {
        res.redirect('/index');
    }
});
app.get('/student/editUserProfile', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status == 3) {
                    Student.findOne({ _id: user._id }).then((p) => {
                        imgModel.findOne({ _id: req.session.uniqueid }).then((ig) => {
                            res.render('editStudentProfile', { student: [p], image: ig });
                        });
                    });
                }
            });
    }
});
app.post('/studenteditUserProfile', function (req, res) {
    console.log(req.body)
    if (req.isAuthenticated()) {
        Student.findOneAndUpdate({ _id: req.session.uniqueid }, {
            gender: req.body.gender,
            phonenumber: req.body.phonenumber,
            dob: req.body.dob
        }).then(stud => {
            console.log(stud)
            res.redirect("/student/userProfile")
        })
    }
});
app.post('/admineditUserProfile', function (req, res) {
    console.log(req.body)
    if (req.isAuthenticated()) {
        Admin.findOneAndUpdate({ _id: req.session.uniqueid }, {
            gender: req.body.gender,
            phonenumber: req.body.phonenumber,
            dob: req.body.dob
        }).then(admin => {
            console.log(admin)
            res.redirect("/admin/userProfile")
        })
    }
});
app.post('/teachereditUserProfile', function (req, res) {
    console.log(req.body)
    if (req.isAuthenticated()) {
        Teacher.findOneAndUpdate({ _id: req.session.uniqueid }, {
            gender: req.body.gender,
            phonenumber: req.body.phonenumber,
            dob: req.body.dob
        }).then(teacher => {
            console.log(teacher)
            res.redirect("/teacher/userProfile")
        })
    }
});

app.get('/teacher/editUserProfile', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status == 2) {
                    Teacher.findOne({ _id: user._id }).then((p) => {
                        imgModel.findOne({ _id: req.session.uniqueid }).then((ig) => {
                            res.render('editTeacherProfile', { teacher: [p], image: ig });
                        });
                    });
                }
            });
    }
});
app.get('/student/userProfile', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status == 3) {
                    Student.findOne({ _id: user._id }).then((p) => {
                        imgModel.findOne({ _id: req.session.uniqueid }).then((ig) => {
                            res.render('studentviewprofile', { detail: [p], image: ig });
                        });
                    });
                }
            });
    }
});
app.get('/teacher/userProfile', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status == 2) {
                    Teacher.findOne({ _id: user._id }).then((p) => {
                        imgModel.findOne({ _id: req.session.uniqueid }).then((ig) => {
                            res.render('teacheruserProfile', { detail: [p], image: ig });
                        });
                    });
                }
            });
    }
});
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/index');
});




app.get('/teacher/viewPerformance/:sid/:subcode', function (req, res) {
    console.log(req.params.sid)
    console.log(req.params.subcode)
    Subject.find({ _id: req.params.subcode }
    ).then(subs => {
        console.log("whoho")
        console.log(subs[0].assignments)
        arr = []
        for (var i = 0; i < subs[0].assignments.length; i++) {

            for (var j = 0; j < subs[0].assignments[i].submissions.length; j++) {

                if (subs[0].assignments[i].submissions[j].studentid == req.params.sid) {
                    subs[0].assignments[i].submissions[j]["name"] = subs[0].assignments[i].assignment_name
                    subs[0].assignments[i].submissions[j]["description"] = subs[0].assignments[i].assignment_description
                    console.log(subs[0].assignments[i].submissions[j].marks)
                    if (subs[0].assignments[i].submissions[j].marks) {
                        console.log(subs[0].assignments[i].submissions[j].marks)
                    }
                    else {
                        console.log("w")
                        subs[0].assignments[i].submissions[j]["marks"] = 'Not Yet Evaluated'
                    }
                    console.log(subs[0].assignments[i].submissions[j])
                    arr.push(subs[0].assignments[i].submissions[j])
                }
            }
        }
        console.log(arr)
        res.render('viewPerformance', { assignment: arr });
    })

});
app.get('/teacher/studentPerformance/:scode', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 2) {
                    res.send('Not a teacher');
                } else {
                    Subject_student_mapping.find({ subjectid: req.params.scode }).then(studs => {
                        arr = []
                        for (var i = 0; i < studs.length; i++) {
                            arr.push(studs[i].studentid)
                        }
                        Student.find({ studentid: { $in: arr } }).then(s => {
                            console.log(s)
                            res.render("studentPerformance", { students: s, subjectid: req.params.scode })
                        })
                    })
                }
            });
    } else {
        res.redirect('/index');
    }
});

app.get('/teacher/:scode', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status == 2) {
                    Subject.findOne({ _id: req.params.scode }, { assignments: 1 }).then(asslist => {

                        res.render("fake", { assignment: asslist, scode: req.params.scode })
                    })
                }
            });
    }
});
app.get('/student/:scode', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status == 3) {
                    Student.findOne({ _id: req.session.uniqueid }).then(stud => {
                        studid = stud.studentid
                        Subject.findOne({ _id: req.params.scode }, { assignments: 1 }).then(asslist => {
                            ans = []
                            console.log(asslist.assignments)
                            for (var i = 0; i < asslist.assignments.length; i++) {
                                s = asslist.assignments[i].submissions
                                var found = 0
                                for (var j = 0; j < s.length; j++) {
                                    if (s[j].studentid == studid) {
                                        found = 1
                                        break
                                    }
                                }
                                if (found == 0) {
                                    ans.push(asslist.assignments[i])
                                }
                            }
                            console.log("HHH")
                            console.log(ans)
                            res.render("viewPerformanceStudent", { assignment: ans, subjectid: req.params.scode })
                        })
                    })
                }
            });
    }
});
app.get('/student/:scode/evaluated', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status == 3) {
                    Student.findOne({ _id: req.session.uniqueid }).then(stud => {
                        studid = stud.studentid
                        Subject.findOne({ _id: req.params.scode }, { assignments: 1 }).then(asslist => {
                            ans = []
                            console.log(asslist.assignments)
                            for (var i = 0; i < asslist.assignments.length; i++) {
                                s = asslist.assignments[i].submissions
                                var found = 0
                                for (var j = 0; j < s.length; j++) {
                                    if (s[j].studentid == studid) {
                                        if (s[j].marks) {
                                            asslist.assignments[i].marksob = s[j].marks
                                        }
                                        else {
                                            asslist.assignments[i].marksob = 'Not Yet Evaluated'
                                        }
                                        ans.push(asslist.assignments[i])
                                        found = 1
                                        break
                                    }
                                }
                            }
                            console.log("HHH")
                            console.log(ans)
                            res.render("results", { assignment: ans, subjectid: req.params.scode })
                        })
                    })
                }
            });
    }
});
app.get('/teacher/:scode/:acode/:eval', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status == 2) {
                    Subject.findOne({ "assignments.assignment_file_code": req.params.acode }, { assignments: { $elemMatch: { assignment_file_code: req.params.acode } } }).then(asslist => {
                        console.log(asslist)
                        arr = []
                        arrne = []
                        for (var i = 0; i < asslist.assignments[0].submissions.length; i++) {
                            if (asslist.assignments[0].submissions[i].evaluated) {
                                arr.push(asslist.assignments[0].submissions[i])
                            }
                            else {
                                arrne.push(asslist.assignments[0].submissions[i])
                            }
                        }
                        if (req.params.eval == "1") {
                            res.render('evaluateAssignment', { assignments: arr, assignmentcode: req.params.acode })
                        }
                        else {
                            res.render('evaluateAssignment', { assignments: arrne, assignmentcode: req.params.acode })
                        }
                    })

                }
            });
    }
});
app.get('/teacher/createassignment/:scode', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status == 2) {
                    res.render("assfake", { subcode: req.params.scode })
                }
            });
    }
});
app.post("/har", function (req, res) {
    console.log("caled")
    console.log(req.body)
})
app.get("/file/:filecode", function (req, res) {
    console.log("called")
    Uploadfile.findOne({ filecode: req.params.filecode }).exec().then(f => {
        res.contentType("application/pdf");
        return res.send(f.file)
    })
})
app.post("/assignmentupload", upload.single('file'), (req, res) => {
    console.log("called")
    createfileid().then(filecode => {
        var obj = {
            filecode: filecode,
            file: fs.readFileSync(
                path.join(__dirname + '/uploads/' + req.file.filename)
            )
        };
        Uploadfile.create(obj).then(uploaded => {
            var obj2 = {
                assignment_file_code: filecode,
                assignment_name: req.body.assignmentname,
                assignment_description: req.body.description
            }
            subid = req.body.scode
            Subjects.findOneAndUpdate({ _id: subid }, {
                $push: { assignments: obj2 }
            }).then(uploaded_ass => {
                res.redirect("/teacherHomePage")
            })
        })
    })
})
app.post("/submitassignment", upload.single('file'), (req, res) => {
    console.log("called")
    Student.findOne({ _id: req.session.uniqueid }, { studentid: 1 }).then(si => {

        createfileid().then(filecode => {
            var obj = {
                filecode: filecode,
                file: fs.readFileSync(
                    path.join(__dirname + '/uploads/' + req.file.filename)
                )
            };
            Uploadfile.create(obj).then(uploaded => {
                var obj2 = {
                    answer_file_code: filecode,
                    evaluated: false,
                    studentid: si.studentid
                }
                subid = req.body.subjectid
                assignmentcode = req.body.assignmentcode
                jsonobj = {}
                jsonobj["assignments.$.submissions"] = obj2
                Subjects.findOneAndUpdate({ "assignments.assignment_file_code": assignmentcode }, {
                    $push: jsonobj
                }).then(submitted_ass => {
                    res.redirect("/studentHomePage")
                })
            })
        })
    })

})
app.post("/evaluate", function (req, res) {
    console.log("evaluation!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    asscode = req.body.assignmentcode
    console.log(req.body)
    Subjects.aggregate([{ "$project": { "matchedIndex": { "$indexOfArray": ["$assignments.assignment_file_code", asscode] } } }]).then(indx => {
        var f = -1
        for (var i = 0; i < indx.length; i++) {
            if (indx[i].matchedIndex >= 0) {
                f = indx[i].matchedIndex
            }
        }
        Subject.findOne({ "assignments.assignment_file_code": req.body.assignmentcode }, { "assignments.submissions": 1 }).then(a => {
            console.log(a.assignments[f].submissions)
            for (var i = 0; i < a.assignments[f].submissions.length; i++) {
                if (a.assignments[f].submissions[i].answer_file_code == req.body.submissioncode) {
                    console.log(i)
                    ind = i
                }
            }
            var jsonobj2 = {}
            jsonobj2["assignments." + f.toString() + '.submissions.' + ind.toString() + '.marks'] = Number(req.body.marks)
            jsonobj2["assignments." + f.toString() + '.submissions.' + ind.toString() + '.evaluated'] = true
            Subjects.updateOne({ "assignments.assignment_file_code": asscode, "assignments.submissions.answer_file_code": req.body.submissioncode }, {
                "$set": jsonobj2
            }).then(a => {
                res.redirect("/teacherHomePage")
            })
        })

    })
})













app.listen(3000, function () {
    console.log('Server is running');
});
