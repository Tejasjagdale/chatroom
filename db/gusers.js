const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const path = require("path");

const themes = [
  "#914900",
  "#ED4245",
  "#5562EA",
  "#FAA61A",
  "#EB459E",
  "#EB459E",
  "#05DA73",
  "#94A5AF",
];

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
  history: {
    theme: {
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
    console.log(error);
  }
};

guserSchema.pre("save", async function (req, res, next) {
  var fs2 = require("fs-extra");
  const rannum = getRandomInt(1, 8);

  fs.exists(`./users/${this._id}/files/profiledp.png`, (exists) => {
    if (!exists) {
      fs2.copySync(
        path.resolve(
          __dirname,
          "../images/profile/default_dp" + rannum + ".png"
        ),
        `./users/${this._id}/files/profiledp.png`
      );
    }
  });

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

  this.history.theme = themes[rannum - 1];

  next();
});

const guser = new mongoose.model("guest", guserSchema);

module.exports = guser;
