const mongoose=require('mongoose');
const validator=require("validator");
const jwt=require('jsonwebtoken');
const _=require('lodash');
var userschema= new mongoose.Schema({

    email:{
        type:String,
        required:true,
        minlength:1,
        trim:true,
        unique:true,
        validate:{
            validator:validator.isEmail,
            message:'{VALUE} is not a valid email'
        }
    },
    password:{
        type:String,
        require:true,
        minlength:6
    },
    tokens:[{
        access:{
            type:String,
            required:true
        },
        token:{
            type:String,
            required:true
        }
    }]
});

userschema.methods.generateAuthToken=function(){
    var user=this;
    var access="auth";

    var token=jwt.sign({_id:user._id.toHexString(),access},'123abc').toString();

    user.tokens.push({access,token});
    return user.save().then(()=>{
        return token;
    });
}

userschema.methods.toJSON=function(){
    var user =this;
    var userobject=user.toObject();
    return _.pick(userobject,['_id','email']);
}

var user=mongoose.model('User_Models',userschema);

module.exports={UserModel:user};
