const mongoose=require('mongoose');
const validator=require("validator");
const jwt=require('jsonwebtoken');
const _=require('lodash');

// creating new  schema
var userschema= new mongoose.Schema({

    email:{
        type:String,
        required:true,
        minlength:1,
        trim:true,
        unique:true,
        validate:{
            validator:validator.isEmail,  // checkout syntax for validation on mongoose validators.
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

userschema.methods.generateAuthToken=function(){ //setting up instance method..
    var user=this;
    var access="auth";

    var token=jwt.sign({_id:user._id.toHexString(),access},'123abc').toString();

    user.tokens.push({access,token});
    return user.save().then(()=>{
        return token; //so that we can access tokens in server.js
    });
}

userschema.methods.toJSON=function(){//overriding default toJSON so that only required info without token is sent back to client on successfull creation of account.
    var user =this;                  //setting up instance method..
    var userobject=user.toObject();
    return _.pick(userobject,['_id','email']);
}

userschema.statics.findByToken=function(token){

    var User=this;//this binding with the model name......
    var decoded;
    
    try{
        decoded=jwt.verify(token,'123abc');
    }catch(e){
    return Promise.reject();
    }

    return user.findOne({
        '_id':decoded._id,
        'tokens.token':token,
        'tokens.access':'auth'
    });
    
};


var user=mongoose.model('User_Models',userschema);

module.exports={UserModel:user};
