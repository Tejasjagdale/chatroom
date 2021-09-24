const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const guserSchema = new mongoose.Schema({
  name: {
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
  history:{
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

guserSchema.methods.generateAuthToken = async function () {
  try {
    const token = await jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRET_KEY
    );
    this.tokens = this.tokens.concat({ token: token });

    await this.save();

    return token;
  } catch (error) {
    res.send("the error is" + error);
    console.log(error);
  }
};

const guser = new mongoose.model("guest", guserSchema);

module.exports = guser;
