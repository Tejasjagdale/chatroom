const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
      profile: {
        type: String,
      },
      display: {
        type: String,
      },
  },
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

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const Register = new mongoose.model("Register", userSchema);

module.exports = Register;
