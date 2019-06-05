// user defined imports
const {app}=require('../server');
const {ToDoModel}=require('../models/todo');
// third party imports
const expect=require('expect');
const request=require('supertest');

var testdata=[{text:'todo 1'},{text:'todo 2'},{text:'todo 3'}];

beforeEach((done)=>{
    ToDoModel.deleteMany({}).then((result)=>{
        ToDoModel.insertMany(testdata);
        done();
    });
});



describe('POST /todos(Creation)',()=>{

    it('Should create a new todo',(done)=>{

        var text="Testing todo creation";

        request(app)          //
            .post('/todos')    // Making a request and sending data to server
            .send({text})     //

            .expect(201)                            // expectations from the reponse 
            .expect((res)=>{                        // client recieves form server
                expect(res.body.text).toBe(text);
            })
            .end((err,res)=>{

                if(err)
                {
                    return done(err);
                }

                // Expectations from the database
                ToDoModel.find({text}).then((todos)=>{

                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e)=>done(e));
            })
    });


    it('Should not create a todo with invalid body data',(done)=>{

        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err,res)=>{
                if(err)
                {
                    return done(err);
                }

                ToDoModel.find().then((todos)=>{

                    expect(todos.length).toBe(3);
                    done();
                }).catch((e)=>done(e));
            })
    });

});



describe('GET /todos(List)',()=>{

    it('Should List all the todos',(done)=>{

        request(app)
            .get('/todos')
            .expect(200)
            .expect((res)=>{
                expect(res.body.docs.length).toBe(3);
            })
            .end(done);
    });
});