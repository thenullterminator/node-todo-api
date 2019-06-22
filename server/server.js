require('./env_config/config');
// local user defined imports
const {authenticate}=require('./middleware/authenticate');
const {mongoose}=require('./database/mongooseconfig');//connected to mongoDB
// Our mongoose models
const {ToDoModel}=require('./models/todo');
const {UserModel}=require('./models/user');

// Third party imports 
const _=require('lodash');
const {ObjectID}=require('mongodb');
const express=require('express');
const bodyparser=require('body-parser');
const bcrypt=require("bcryptjs");
// Setting up the port
const port=process.env.PORT;

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

// post route for new user account
app.post('/users',(req,res)=>{

    var body=_.pick(req.body,['email','password']);
    var newuser=new UserModel(body);
    newuser.save().then((doc)=>{
        return newuser.generateAuthToken();
    }).then((token)=>{
        // setting header and sending only required info back using overrid toJSON function
        res.header('x-auth',token).status(201).send(newuser);
    }).catch((e)=>{
        res.status(400).send(e);
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

// post route for login 
app.post('/users/login',(req,res)=>{

    var body=_.pick(req.body,['email','password']);

    UserModel.findByCredentials(body.email,body.password).then((user)=>{
        return user.generateAuthToken().then((token)=>{
            res.header('x-auth',token).send(user);
        });
    }).catch((e)=>{
        res.status(400).send();
    });
});

// delete route for logout page

app.delete('/users/me/token',authenticate,(req,res)=>{

    req.user.removeToken(req.token).then(()=>{
        res.status(200).send();
    },()=>{
        res.status(400).send();
    })

});



//get route for me page
app.get('/users/me',authenticate,(req,res)=>{
    res.send(req.user);
});

// get route to fetch todo corresponding to a particular id
app.get('/todos/:id',(req,res)=>{

    if(!ObjectID.isValid(req.params.id))
    {
        return  res.status(400).send({});
    }
    

    ToDoModel.findById(req.params.id).then((todo)=>{
        if(!todo)
        {
            return res.status(404).send({});
        }
        res.status(200).send(todo);
    }).catch((e)=>res.status(400).send(e));
    
});

// delete route to delete a todo by id

app.delete('/todos/:id',(req,res)=>{

    if(!ObjectID.isValid(req.params.id))
    {
        return res.status(400).send();
    }

    ToDoModel.findByIdAndDelete(req.params.id).then((todo)=>{
        if(!todo)
        {
            return res.status(404).send();
        }
        res.status(200).send(todo);
    }).catch((e)=>res.status(400).send(e));
});


// update route to update a todo by id

app.patch('/todos/:id',(req,res)=>{

    var body=_.pick(req.body,['text','completed']);//will pick those properties only if they existed


    if(!ObjectID.isValid(req.params.id))
    {
        return res.status(400).send();
    }

    if(_.isBoolean(body.completed)&&body.completed){
        body.completedAt=new Date().getTime();
    }
    else
    {
        body.completed=false;
        body.completedAt=null;
    }

    ToDoModel.findByIdAndUpdate(req.params.id,{$set:body},{new:true}).then((todo)=>{
        if(!todo)
        {
            return res.status(404).send();
        }

        res.status(200).send(todo);
    }).catch((e)=>res.status(400).send(e)); 


});



// setting up listener
app.listen(port,()=>{
console.log(`Server is up on port ${port}`);
});


// eporting our app.
module.exports={app};