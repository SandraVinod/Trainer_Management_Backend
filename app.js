const express = require("express");
app = new express();
const cors = require('cors');
const userdata = require('./src/model/userdata');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const allocateddata = require('./src/model/allocateddata');
const enrollmentdata = require('./src/model/enrollmentdata');
const trainerdata = require('./src/model/trainerdata');
const multer = require('multer');
const ImageDataURI = require('image-data-uri');

app.use(express.static('public'));
// const { request } = require("http");
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

adminemail = 'admin@gmail.com';
password = 'admin@123';
var storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, './public/images/requests')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

app.post('/signup', function (req, res) {
  res.header("Access-Control-Allow-Orgin", "*");
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS");
  trainer = req.body.trainer;
  // console.log(trainer.traineremail);
  var newuser = {
    useremail: trainer.traineremail,
    username: trainer.trainerusername,
    password: trainer.trainerpass,
    role: "normaluser"
  };
  userdata.findOne({ useremail: trainer.traineremail.trim() })
    .then(function (data) {
      // res.status(500).send("User already exixts")
      if (data === null) {
        var user = userdata(newuser);
        user.save();
        res.status(200).send();
      }
      else {
        console.log("User already exixts")
        res.status(401).send(false);
      }
      // console.log(user);
    });

});
app.post('/signin', function (req, res) {
  res.header("Access-Control-Allow-Orgin", "*");
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS");
  res.status(200);
  trainer = req.body.trainer;
  // console.log(trainer);
  userdata.findOne({ "useremail": trainer.traineremail })
    .then(function (data) {
      if (data.password === trainer.trainerpass) {
        var payload = { subject: data.useremail }
        var token = jwt.sign(payload, 'secretkey');
        res.status(200).send({ token, email: trainer.traineremail });
        // res.status(200);
      }
      else {
        res.status(401).send('Invalid login')

      }
    })
    .catch((err) => {
      message = 'failed'
      res.status(401).send({ message });
    })
});


app.post('/admin', function (req, res) {
  res.header("Access-Control-Allow-Orgin", "*");
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS");
  // res.status(200);
  admin = req.body.admin;
  console.log(admin);
  if (!(adminemail === admin.adminemail && password === admin.adminpass)) {
    res.status(401).send('Invalid Login')

  }

  else {
    console.log("successful login");
    // res.status(200);

    let payload = { subject: adminemail + password }
    let token = jwt.sign(payload, 'secretKey')
    res.status(200).send({ token })
  }
});
app.post('/request', (req, res) => {
  res.header("Access-Control-Allow-Orgin", "*");
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS");
  console.log('hi');
  var upload = multer({ storage: storage }).single('img');
  upload(req, res, (err) => {

    if (err) {
      console.log(err);
    }
    else {
      if (req.file) {
        var item = {
          fname: req.body.fname,
          lname: req.body.lname,
          address: req.body.address,
          email: req.body.email,
          phno: req.body.phno,
          qual: req.body.qual,
          skill: req.body.skill,
          comp: req.body.comp,
          desgn: req.body.desgn,
          course: req.body.course,
          img: req.file.filename
        }
      }
      else {
        var item = {
          fname: req.body.fname,
          lname: req.body.lname,
          address: req.body.address,
          email: req.body.email,
          phno: req.body.phno,
          qual: req.body.qual,
          skill: req.body.skill,
          comp: req.body.comp,
          desgn: req.body.desgn,
          course: req.body.course
        }
        console.log("error in saving the image")
      }
      var enrollment = new enrollmentdata(item);
      enrollment.save();
    }
  })
});

app.get('/trainerProfile:token', function (req, res) {
  res.header("Access-Control-Allow-Orgin", "*");
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS");

  token = req.params.token;
  payload = jwt.verify(token, 'secretkey');
  trainerdata.findOne({ email: payload.subject })
    .then(function (data) {
      res.send(data);
      console.log(data);
    });
});
app.get('/requestlist', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTION");
  enrollmentdata.find()
    .then(function (requests) {
      res.send(requests);
    });
});
app.delete('/reject/:id', (req, res) => {

  id = req.params.id;
  enrollmentdata.findByIdAndDelete({ "_id": id })
    .then(() => {
      console.log('rejected a trainer request')
      res.send();
    })
})
app.get('/approverequest/:id', (req, res) => {

  const id = req.params.id;
  enrollmentdata.findOne({ "_id": id })
    .then((request) => {
      console.log('approve request ' + request)
      res.send(request);
    });
})


app.post('/approvedtrainer', async function (req, res) {

  console.log(req.body);
  var fname = req.body.fname;
  var typeemp = req.body.typeemp;
  var id = fname.toUpperCase() + '_' + typeemp.toUpperCase().substr(0,3) + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();;
  var approvedlist = {
    fname: req.body.fname,
    lname: req.body.lname,
    address: req.body.address,
    email: req.body.email,
    phno: req.body.phno,
    qual: req.body.qual,
    skill: req.body.skill,
    comp: req.body.comp,
    desgn: req.body.desgn,
    course: req.body.course,
    img: req.body.img,
    typeemp: req.body.typeemp,
    id: id
  }


  console.log('approvedlist ' + approvedlist)
  var approvedlist = new trainerdata(approvedlist);
  approvedlist.save();
  const traineremail = await enrollmentdata.findOne({ email: approvedlist.email })

  var transport = nodemailer.createTransport(
    {
      service: 'gmail',
      auth: {
        user: 'ictakproject@gmail.com',
        pass: 'ahngshycdtwaagvc'
      }
    }
  )

  var mailOptions = {

    from: 'ictakproject@gmail.com',
    to: approvedlist.email,
    subject: 'You are Approved as an ICT Trainer',
    text: `Congratulations ${approvedlist.fname}  ${approvedlist.lname}.Thank you for being a part of ICT Trainers.You are approved as ${approvedlist.typeemp}  Trainer for course ${approvedlist.course} and your ID is ${approvedlist.id}.
    
    Please contact us regarding any query.

    Thanks and Regards,
    ICTAK TEAM
    `
  }
  transport.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error + " error in senting email")
    }
    else {
      console.log("email sent " + info.response)
    }
  })
  enrollmentdata.findOneAndDelete({ "_id": traineremail._id })
    .then(() => {
      console.log('successfully deleted from enrollment list')
      res.send();
    })
});
app.get('/getTrainers', (req, res) => {
  res.header("Access-Control-Allow-Orgin", "*");
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS");
  trainerdata.find().then((trainers) => {
    res.send(trainers);
  })
})
app.get('/search/:name', (req, res) => {
  res.header("Access-Control-Allow-Orgin", "*");
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS");
  console.log(req.params);
  var regex = new RegExp(req.params.name, 'i');
  trainerdata.find({ $or: [{ fname: regex }, { lname: regex }] }).then((data) => {
    res.send(data);
  })

})
app.get('/search/course/:course', (req, res) => {
  res.header("Access-Control-Allow-Orgin", "*");
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS");
  console.log(req.params);
  var regex = new RegExp(req.params.course, 'i');
  trainerdata.find({ course: regex }).then((data) => {
    res.send(data);
  })

})
app.get('/search/skill/:skill', (req, res) => {
  res.header("Access-Control-Allow-Orgin", "*");
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS");
  console.log(req.params);

  var regex = new RegExp(req.params.skill, 'i');
  trainerdata.find({ skill: regex }).then((data) => {
    res.send(data);
  })

})
app.get('/search/type/:typeemp', (req, res) => {
  res.header("Access-Control-Allow-Orgin", "*");
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS");
  console.log(req.params);
  var regex = new RegExp(req.params.typeemp, 'i');
  trainerdata.find({ typeemp: regex }).then((data) => {
    res.send(data);
  })

})
app.get('/getTrainer/:id', (req, res) => {

  const id = req.params.id;
  trainerdata.findOne({ "_id": id })
    .then((trainer) => {
      console.log('trainer ' + trainer)
      res.send(trainer);
    });
})
app.post('/trainerallocate', async (req, res) => {
  // console.log('allocated data '+req.body)
  var allocatedlist = {
    id: req.body.id,
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    course: req.body.course,
    startdate: req.body.startdate,
    enddate: req.body.enddate,
    time: req.body.time,
    courseid: req.body.courseid,
    batchid: req.body.batchid,
    meetinglink: req.body.meetinglink
  }


  console.log('allocatedlist ' + allocatedlist)
  var allocatedlist = new allocateddata(allocatedlist);
  allocatedlist.save();
  const traineremail = await allocateddata.findOne({ email: allocatedlist.email })

  var transport = nodemailer.createTransport(
    {
      service: 'gmail',
      auth: {
        user: 'ictakproject@gmail.com',
        pass: 'ahngshycdtwaagvc'
      }
    }
  )

  var mailOptions = {

    from: 'ictakproject@gmail.com',
    to: allocatedlist.email,
    subject: 'ICT Trainer Schedule ',
    text: `Hi ${allocatedlist.fname}  ${allocatedlist.lname} ,You are assigned for the course ${allocatedlist.course}.The details are
    Start Date:${allocatedlist.startdate},
    End Date: ${allocatedlist.enddate},
    Time:${allocatedlist.time},
    Course Id: ${allocatedlist.courseid},     
    Batch Id: ${allocatedlist.batchid},
    Meeting Link: ${allocatedlist.meetinglink}

    Please contact us regarding any query.

    Thanks and Regards,
    ICTAK TEAM
    `
  }
  transport.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error + " error in senting email")
    }
    else {
      console.log("email sent " + info.response)
    }
  })
})

app.post('/editProfile', (req, res) => {
  res.header("Access-Control-Allow-Orgin", "*");
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS");
  email = req.body.email;
  console.log(email);
  trainerdata.findOne({ email: email }).then((trainer) => {

    res.send(trainer);

  });
});

app.post('/editTrainerProfile', (req, res) => {
  // res.header("Access-Control-Allow-Orgin", "*");
  // res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS");
  console.log(req.body.img);

  if (req.body.url !== "") {
    var imageName = `${req.body.email}_${req.body.img}`;
    ImageDataURI.outputFile(req.body.url, `public/images/requests/${imageName}`);
  } else {
    imageName = req.body.img
  }
  trainerdata.updateMany({ "email": req.body.email }, {
    fname: req.body.fname,
    lname: req.body.lname,
    address: req.body.address,
    phno: req.body.phno,
    qual: req.body.qual,
    skill: req.body.skill,
    comp: req.body.comp,
    desgn: req.body.desgn,
    img: imageName
  }).then((data) => {
    // console.log(data);
    res.status(200).send();
  })
});

app.post('/checkapproved', (req, res) => {
  res.header("Access-Control-Allow-Orgin", "*");
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS");
  console.log(req.body.email);
  useremail = req.body.email;
  trainerdata.findOne({ email: useremail }).then((data) => {
    if (data) {
      res.send();
    }
    
  })
  
 })
app.post('/checkdates',(req,res)=>{
  email=req.body.email;
  console.log(email);
  allocateddata.find({email:email}).then((data)=>{
    res.send(data);
  })
})
 

app.get('/allocatedlist', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTION");
  allocateddata.find()
    .then(function (trainer) {
      res.send(trainer);
    });
});
app.delete('/remove/:id', (req, res) => {

  id = req.params.id;
  trainerdata.findOne({_id:id})
  .then((data) =>{
    email=data.email;
  })
  trainerdata.findByIdAndDelete({ "_id": id })
    .then(() => {
      allocateddata.findOneAndDelete({'email':email})
      .then(() => {
       
        console.log('removed a trainer ')
        res.send();
      })
   
    })
})
app.post('/schedule', function (req, res) {
  res.header("Access-Control-Allow-Orgin", "*");
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS");
  email=req.body.email;
  // token = req.params.token;
  // payload = jwt.verify(token, 'secretkey');
  allocateddata.find({ email:email})
    .then(function (data) {
      res.send(data);
      console.log(data);
    });
});
app.get('/getnumbers',(req,res)=>{
  res.header("Access-Control-Allow-Orgin", "*");
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS");
  var numbers=[];
  enrollmentdata.countDocuments().then((no)=>{
   numbers.push(no);
   allocateddata.countDocuments().then((no)=>{
    numbers.push(no);
    trainerdata.countDocuments().then((no)=>{
      numbers.push(no);
      console.log(numbers);
      res.send(numbers);
    })
 })
  })
  
  
})

app.listen(3000, function () {
  console.log("listening to port number: 3000");

});
