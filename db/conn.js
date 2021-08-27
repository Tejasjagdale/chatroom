const mongoose =  require("mongoose");

mongoose.connect(process.env.DB,{
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