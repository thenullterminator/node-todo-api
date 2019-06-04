const mongoose=require('mongoose');
mongoose.Promise=global.Promise;
mongoose.connect('mongodb://localhost:27017/To_Do_App',{ useNewUrlParser: true });

module.exports={
    mongoose:mongoose
}