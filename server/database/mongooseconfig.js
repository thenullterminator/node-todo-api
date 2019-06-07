const mongoose=require('mongoose');
mongoose.Promise=global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.MONGODB_URI,{ useNewUrlParser: true });

module.exports={
    mongoose:mongoose
}