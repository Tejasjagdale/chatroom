const mongoose =  require("mongoose");

const DB = 'mongodb+srv://tejas:tejas1234@cluster0.gpcgz.mongodb.net/chatapp?retryWrites=true&w=majority';

mongoose.connect(DB,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify:false,
});

var db=mongoose.connection;

db.on('error', console.log.bind(console, "connection error"));
db.once('open', ()=>{
    console.log("connection to database succeeded!");
});