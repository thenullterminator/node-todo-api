const {mongoose}=require('./database/mongooseconfig');
const {ToDoModel}=require('./models/todo');
const {UserModel}=require('./models/user');

const express=require('express');
const bodyparser=require('body-parser');
const port=process.env.PORT||3001;

var app=express();

app.use(bodyparser.json());

app.post('/createtodos',(req,res)=>{

    var newtodo=new ToDoModel(req.body);
    
    newtodo.save().then((doc)=>{
        res.status(201).send(doc);
    },(error)=>{
        res.status(400).send(error);
    })
});

app.listen(port,()=>{
console.log(`Server is up on port ${port}`);
});