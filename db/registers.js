const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
const jwt = require("jsonwebtoken");

const themes = ['#914900','#ED4245','#5562EA','#FAA61A','#EB459E','#EB459E','#05DA73','#94A5AF'];

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
  },
  joined: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  frnds: [
    {
      sender: { type: String },
      receiver: { type: String },
      sender_id: { type: String },
      receiver_id: { type: String },
      status: { type: String },
    },
  ],
  pmmsgs: [
    {
      sender: {
        type: String,
      },
      sender_id: {
        type: String,
      },
      message: {
        type: String,
      },
      receiver: {
        type: String,
      },
      receiver_id: {
        type: String,
      },
      time: {
        type: String,
      },
    },
  ],
  blocks: [
    {
      usertype: {
        type: String,
      },
      username: {
        type: String,
      },
      userid: {
        type: String,
      },
    },
  ],
  history: {
    theme: {
      type: String,
    },
    display: {
      type: String,
    },
  },
  pms: [
    {
      sender: {
        type: String,
      },
      sender_id: {
        type: String,
      },
      nom: {
        type: String,
      },
    },
  ],
  alerts: [
    {
      sender: {
        type: String,
      },
      sender_id: {
        type: String,
      },
      nom: {
        type: String,
      },
    },
  ],
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.methods.generateAuthToken = async function () {
  try {
    const token = await jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRET_KEY
    );
    this.tokens = this.tokens.concat({ token: token });

    await this.save();

    return token;
    // const userver = await jwt.verify(token,"mynameistejashemantjagdaleyoutgotitbrohopeyougotit");
  } catch (error) {
    console.log(error);
  }
};

userSchema.pre("save", async function (req,res,next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  var fs = require("fs");

  const dir = `./users/${this._id}`;
  const dir2 = `./users/${this._id}/rhythm`;
  const dir3 = `./users/${this._id}/files`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    });
  }

  if (!fs.existsSync(dir2)) {
    fs.mkdirSync(dir2, {
      recursive: true,
    });
  }

  if (!fs.existsSync(dir3)) {
    fs.mkdirSync(dir3, {
      recursive: true,
    });
  }

  const rannum = getRandomInt(1, 8);

  var fs = require('fs');
   
    // Using fs.exists() method
    fs.exists(`./users/${this._id}/files/profiledp.png`, (exists) => {
      if(!exists){
        fs.copySync(
          path.resolve(__dirname, "../images/profile/default_dp" + rannum + ".png"),
          `./users/${this._id}/files/profiledp.png`
        );
      }  
    });

  this.history.theme = themes[rannum-1]

  next();
});

const Register = new mongoose.model("Register", userSchema);

module.exports = Register;
