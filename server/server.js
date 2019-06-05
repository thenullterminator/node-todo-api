// local user defined imports
const {mongoose}=require('./database/mongooseconfig');//connected to mongoDB
// Our mongoose models
const {ToDoModel}=require('./models/todo');
const {UserModel}=require('./models/user');

// Third party imports 
const express=require('express');
const bodyparser=require('body-parser');
// Setting up the port
const port=process.env.PORT||3000;

// creating a brand new app
var app=express();

// Setting up the middleware to recieve body in the form of json
app.use(bodyparser.json());

// post route to create todos
app.post('/todos',(req,res)=>{

    var newtodo=new ToDoModel(req.body);
    
    newtodo.save().then((doc)=>{
        res.status(201).send(doc);
    },(error)=>{
        res.status(400).send(error);
    });
});

// get route to list all existing todos
app.get('/todos',(req,res)=>{

ToDoModel.find().then((docs)=>{
    res.send({docs});
},(e)=>{
    res.status(401).send(e);
})
});



// setting up listener
app.listen(port,()=>{
console.log(`Server is up on port ${port}`);
});


// eporting our app.
module.exports={app};