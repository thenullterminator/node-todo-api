const MongoClient=require("mongodb").MongoClient;

MongoClient.connect('mongodb://localhost:27017/ToDoApp',(err,client)=>{

    if(err)
    {
        return console.log("Unable to connect to MongoDB server :( ");
    }

    console.log("Connected to MongoDB server :) ");

    var db = client.db();

    // db.collection('ToDos').insertOne({
    //     text:'Something to do',
    //     completed:'false'
    // },
    // (err,result)=>{
    //     if(err)
    //     {
    //         return console.log("There occured the following error: ",err);
    //     }

    //     console.log(JSON.stringify(result.ops,undefined,2));
    // });



    db.collection('Users').find({age:18}).toArray().then((docs)=>{
        console.log(docs);
    },(err)=>{

    });


    client.close();
});