const mongoose=require('mongoose');

var user=mongoose.model('User_Models',{

    email:{
        type:String,
        required:true,
        minlength:1,
        trim:true
    }
});

module.exports={UserModel:user};
