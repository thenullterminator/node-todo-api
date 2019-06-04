const mongoose=require('mongoose');

var todo=mongoose.model('To_Do_Models',{

    text:{
        type:String,
        required:true,
        minlength:1,
        trim:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    completedAt:{
        type:Number,
        default:null
    }
});


module.exports={ToDoModel:todo};
