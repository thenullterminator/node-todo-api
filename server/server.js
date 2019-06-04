var mongoose=require("mongoose");

mongoose.Promise=global.Promise;
mongoose.connect('mongodb://localhost:27017/To_Do_App',{ useNewUrlParser: true });

var todo=mongoose.model('to_do_prototype',{

    text:{
        type:String
    },
    completed:{
        type:Boolean
    },
    completedAt:{
        type:Number
    }
});


var newtodo= new todo({
    text:'Cooking Dinner',
    completed:true,
    completedAt:1900
});

newtodo.save().then((doc)=>{
    console.log(doc);
},(e)=>{
    console.log('some error occurred');
});


// mongoose.disconnect();