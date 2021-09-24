const jwt = require("jsonwebtoken");
const Register = require("../db/registers");
const Gusers = require("../db/gusers");

const auth = async (req,res,next)=>{
    try {
        const token = req.cookies.chatroomjwt.token;
        const user_type = req.cookies.chatroomjwt.user_type;
        const verifyUser = jwt.verify(token,process.env.SECRET_KEY);

        if(user_type == "register"){
            const user = await Register.findOne({_id:verifyUser._id}); 
            
            req.token = token;
            req.user = user;

            // console.log(user.name);

        }else{
            const user = await Gusers.findOne({_id:verifyUser._id});

            req.token = token;
            req.user = user;

            // console.log(user.name);

        }

        next();

    } catch (error) {
        res.redirect("/");
    }
};

module.exports = auth;