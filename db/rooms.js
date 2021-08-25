const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt =  require("jsonwebtoken");

const roomSchema = new mongoose.Schema({
    roomname:{
        type:String,
        required:true,
        unique:true
    },
    roompass:{
        type:String,
        required:true
    },
    roommsgs:[{
        "sender":{
            type:String,
        },
        "message":{
            type:String,
        },
        "id":{
            type:String,
        },
        "time":{
            type:String,
        }
    }]
});

roomSchema.pre("save", async function(next){

    if(this.isModified("roompass")){
        this.roompass = await bcrypt.hash(this.roompass,10)
    }
    next();
})

const rooms = new mongoose.model("rooms",roomSchema);

module.exports = rooms;