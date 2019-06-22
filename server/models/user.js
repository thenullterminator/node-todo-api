const mongoose=require('mongoose');
const validator=require("validator");
const jwt=require('jsonwebtoken');
const _=require('lodash');
const bcrypt=require('bcryptjs');
// creating new  schema
var userschema= new mongoose.Schema({

    email:{
        type:String,
        unique:true,
        required:true,
        minlength:1,
        trim:true,
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

    var token=jwt.sign({_id:user._id.toHexString(),access},process.env.JWT_SECRET).toString();

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

userschema.methods.removeToken=function(token){

    var user=this;
    return user.update({
        $pull:{
            tokens:{token}
        }
    });

};
userschema.statics.findByToken=function(token){

    var User=this;//this binding with the model name......
    var decoded;
    
    try{
        decoded=jwt.verify(token,process.env.JWT_SECRET);
    }catch(e){
    return Promise.reject();
    }

    return user.findOne({
        '_id':decoded._id,
        'tokens.token':token,
        'tokens.access':'auth'
    });
    
};

userschema.statics.findByCredentials=function(email,password){

    var UserModel=this;

    return UserModel.findOne({email}).then((user)=>{
        if(!user){
            return Promise.reject();
        }

        return new Promise((resolve,reject)=>{
            bcrypt.compare(password,user.password,(err,res)=>{
                if(res){
                    resolve(user);
                }
                else{
                    reject();
                }
            });
        });

    });

};

userschema.pre('save',function(next){
    var user=this;

    if(user.isModified('password')){

        bcrypt.genSalt(10,(err,salt)=>{

            bcrypt.hash(user.password,salt,(err,hash)=>{
                user.password=hash;
                next();
            });
        });
    }
    else
    {
        next();
    }
});



var user=mongoose.model('User_Models',userschema);

module.exports={UserModel:user};
