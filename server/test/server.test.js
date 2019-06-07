// user defined imports
const {app}=require('../server');
const {ToDoModel}=require('../models/todo');
// third party imports
const expect=require('expect');
const request=require('supertest');
const {ObjectID}=require('mongodb');


var testdata=[{text:'todo 1',_id: new ObjectID},{text:'todo 2',_id: new ObjectID},{completed:true,completedAt:42323,text:'todo 3',_id: new ObjectID}];

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


describe('GET /todos/:id',()=>{

    it('should not run since id is invalid',(done)=>{

        request(app)
            .get('/todos/14234')
            .expect(400)
            .end(done);
    });

    it('should not have any item of this particular valid id',(done)=>{


        request(app)
            .get('/todos/5cf8ace6e2861b7a327db0ba')
            .expect(404)
            .end(done);

    });

    it('should return the appropriate todo corresponding to the given id',(done)=>{
         
        var id='';
        ToDoModel.findOne({text:'todo 3'}).then((todo)=>{
            if(todo)
            {
                request(app)
                .get(`/todos/${todo.id}`)
                .expect(200)
                .expect((res)=>{
                        expect(res.body.text).toBe('todo 3');
                })
                .end(done);
            }

        },(error)=>{});
    });
});




describe('DELETE /todos/:id',()=>{

    it('should remove a todo',(done)=>{

        var testid=testdata[1]._id.toHexString();

        request(app)
            .delete(`/todos/${testid}`)
            .expect(200)
            .expect((res)=>{
                expect(res.body._id).toBe(testid);
            })
            .end((err,res)=>{

                if(err)
                {
                    return done(err);
                }

                ToDoModel.findById(testid).then((todo)=>{
                    expect(todo).toNotExist();
                    done();
                }).catch((e)=>done(e));
            });


    });

    it('should not run since id is invalid',(done)=>{

        request(app)
            .delete('/todos/14234')
            .expect(400)
            .end(done);
    });


    it('should not have any item of this particular valid id',(done)=>{


        request(app)
            .delete('/todos/5cf8ace6e2861b7a327db0ba')
            .expect(404)
            .end(done);

    });
});



describe('PATCH /todos/:id',(req,res)=>{

    it('should update the todo',(done)=>{
        
        request(app)
            .patch(`/todos/${testdata[0]._id.toHexString()}`)
            .send({text:"todo 1 completed",completed:true})
            .expect(200)
            .expect((res)=>{
                expect(res.body.text).toBe('todo 1 completed');
                expect(res.body.completed).toBe(true);
                expect(res.body.completedAt).toNotBe(null);
                expect(res.body._id).toBe(testdata[0]._id.toHexString());
            })
            .end((err,res)=>{
                
                if(err)
                {
                    return done(err);
                }

                ToDoModel.findById(testdata[0]._id.toHexString()).then((todo)=>{
                    
                    expect(todo).toExist();
                    expect(todo.text).toBe('todo 1 completed');
                    expect(todo.completed).toBe(true);
                    expect(todo.completedAt).toNotBe(null);
                    expect(todo._id).toEqual(testdata[0]._id);
                    done();
                }).catch((e)=>done(e));

            });
    });

    it('should clear completedAt when todo is not completed',(done)=>{

        request(app)
        .patch(`/todos/${testdata[2]._id.toHexString()}`)
        .send({text:'todo 3 is not completed',completed:false})
        .expect(200)
        .expect((res)=>{
            expect(res.body.text).toBe('todo 3 is not completed');
            expect(res.body.completed).toBe(false);
            expect(res.body.completedAt).toBe(null);
            expect(res.body._id).toBe(testdata[2]._id.toHexString());
        })
        .end((err,res)=>{
            
            if(err)
            {
                return done(err);
            }

            ToDoModel.findById(testdata[2]._id.toHexString()).then((todo)=>{
                
                expect(todo).toExist();
                expect(todo.text).toBe('todo 3 is not completed');
                expect(todo.completed).toBe(false);
                expect(todo.completedAt).toBe(null);
                expect(todo._id).toEqual(testdata[2]._id);
                done();
            }).catch((e)=>done(e));
        });
    });
});
