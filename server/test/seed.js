const {ObjectID}=require('mongodb');
const {ToDoModel}=require('../models/todo');
const {UserModel}=require('../models/user');
const jwt=require('jsonwebtoken');
var id1=new ObjectID(),id2=new ObjectID();
var testdata=[{text:'todo 1',_id: new ObjectID,_creator:id1},{text:'todo 2',_id: new ObjectID,_creator:id2},{completed:true,completedAt:42323,text:'todo 3',_id: new ObjectID,_creator:id2}];

const populatetodos=(done)=>{
    ToDoModel.deleteMany({}).then((result)=>{
        ToDoModel.insertMany(testdata);
        done();
    });
};



const userdata=[{
    _id:id1,
    email:'abc@abc.abc',
    password:'password1',
    tokens:[{
        access:'auth',
        token:jwt.sign({_id:id1,access:'auth'},'123abc').toString()
    }]
},{
    _id:id2,
    email:'asd@asd.asd',
    password:'password2',
    tokens:[{
        access:'auth',
        token:jwt.sign({_id:id2,access:'auth'},'123abc').toString()
    }]
}];

const populateusers=(done)=>{
    UserModel.deleteMany({}).then((result)=>{
        var u1= new UserModel(userdata[0]).save();// save() returns a promise
        var u2= new UserModel(userdata[1]).save();// save() returns a promise
        return Promise.all([u1,u2]);
    }).then(()=>done());
};
module.exports={testdata,populatetodos,userdata,populateusers};