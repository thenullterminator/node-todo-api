// user defined imports
const {app}=require('../server');
const {ToDoModel}=require('../models/todo');
const {UserModel}=require('../models/user');
const {testdata,populatetodos,userdata,populateusers}=require('./seed');
// third party imports
const expect=require('expect');
const request=require('supertest');
const {ObjectID}=require('mongodb');

beforeEach(populateusers);
beforeEach(populatetodos);

describe('POST /todos(Creation)',()=>{

    it('Should create a new todo',(done)=>{

        var text="Testing todo creation";

        request(app)          //
            .post('/todos')    // Making a request and sending data to server
            .send({text})     //
            .set('x-auth',userdata[0].tokens[0].token)
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
            .set('x-auth',userdata[0].tokens[0].token)
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
            .set('x-auth',userdata[0].tokens[0].token)
            .expect(200)
            .expect((res)=>{
                expect(res.body.docs.length).toBe(1);
            })
            .end(done);
    });
});


describe('GET /todos/:id',()=>{

    it('should not return todo created by some other user',(done)=>{

        var id='';
        ToDoModel.findOne({text:'todo 2'}).then((todo)=>{
            if(todo)
            {
                request(app)
                .get(`/todos/${todo.id}`)
                .set('x-auth',userdata[0].tokens[0].token)
                .expect(404)
                .end(done);
            }

        },(error)=>{});

    });
    it('should not run since id is invalid',(done)=>{

        request(app)
            .get('/todos/14234')
            .set('x-auth',userdata[0].tokens[0].token)
            .expect(400)
            .end(done);
    });

    it('should not have any item of this particular valid id',(done)=>{


        request(app)
            .get('/todos/5cf8ace6e2861b7a327db0ba')
            .set('x-auth',userdata[0].tokens[0].token)
            .expect(404)
            .end(done);

    });

    it('should return the appropriate todo corresponding to the given id',(done)=>{
         
        var id='';
        ToDoModel.findOne({text:'todo 1'}).then((todo)=>{
            if(todo)
            {
                request(app)
                .get(`/todos/${todo.id}`)
                .set('x-auth',userdata[0].tokens[0].token)
                .expect(200)
                .expect((res)=>{
                        expect(res.body.text).toBe('todo 1');
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
            .set('x-auth',userdata[1].tokens[0].token)
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

    it('should not remove a todo of other user',(done)=>{

        var testid=testdata[0]._id.toHexString();

        request(app)
            .delete(`/todos/${testid}`)
            .set('x-auth',userdata[1].tokens[0].token)
            .expect(404)
            .end((err,res)=>{

                if(err)
                {
                    return done(err);
                }

                ToDoModel.findById(testid).then((todo)=>{
                    expect(todo).toExist();
                    done();
                }).catch((e)=>done(e));
            });


    });

    it('should not run since id is invalid',(done)=>{

        request(app)
            .delete('/todos/14234')
            .set('x-auth',userdata[1].tokens[0].token)
            .expect(400)
            .end(done);
    });


    it('should not have any item of this particular valid id',(done)=>{


        request(app)
            .delete('/todos/5cf8ace6e2861b7a327db0ba')
            .set('x-auth',userdata[1].tokens[0].token)
            .expect(404)
            .end(done);

    });
});



describe('PATCH /todos/:id',()=>{

    it('should not update todo of other user',(done)=>{
        request(app)
        .patch(`/todos/${testdata[1]._id.toHexString()}`)
        .set('x-auth',userdata[0].tokens[0].token)
        .send({text:"todo 1 completed",completed:true})
        .expect(404)
        .end(done);

    });

    it('should update the todo',(done)=>{
        
        request(app)
            .patch(`/todos/${testdata[0]._id.toHexString()}`)
            .set('x-auth',userdata[0].tokens[0].token)
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
        .set('x-auth',userdata[1].tokens[0].token)
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


describe('GET /users/me',()=>{

    it('should return user if authenticated',(done)=>{
        request(app)
            .get('/users/me')
            .set('x-auth',userdata[0].tokens[0].token)
            .expect(200)
            .expect((res)=>{
                expect(res.body.email).toBe(userdata[0].email);
                expect(res.body._id).toBe(userdata[0]._id.toHexString());
            })
            .end(done);
    });


    it('should not return user if not authenticated',(done)=>{

        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res)=>{
                expect(res.body).toEqual({})
            })
            .end(done);
    });

});


describe('POST /users',()=>{

    it('should create a user',(done)=>{
        
        request(app)
            .post('/users')
            .send({email:"pqr@pqr.pqr",password:"1234567"})
            .expect(201)
            .expect((res)=>{
                expect(res.body.email).toBe('pqr@pqr.pqr');
                expect(res.body._id).toExist();
                expect(res.headers['x-auth']).toExist();
            })
            .end((err)=>{
                if(err){
                    return done(err);
                }

                UserModel.findOne({email:"pqr@pqr.pqr"}).then((user)=>{
                    expect(user).toExist();
                    expect(user.password).toNotBe("1234567");
                    done();
                }).catch((e)=>done(e));
            });

    });


    it('should not create user if email already in use',(done)=>{

        request(app)
            .post('/users')
            .send({email:"abc@abc.abc",password:"1234567"})
            .expect(400)
            .end(done);
    });

    it('should not create user if there are validation errors',(done)=>{

        request(app)
            .post('/users')
            .send({email:"abcd@abc.abc",password:"12345"})
            .expect(400)
            .end(done);
    });


});



describe('POST /users/login',()=>{

    it('should login user and return auth token',(done)=>{

        request(app)
            .post('/users/login')
            .send({
                email:userdata[1].email,
                password:userdata[1].password
            })
            .expect(200)
            .expect((res)=>{
                expect(res.headers['x-auth']).toExist();
            })
            .end((err,res)=>{
                if(err){
                    return done(err);
                }

                UserModel.findById(userdata[1]._id).then((user)=>{
                    expect(user.tokens[1]).toInclude({
                        access:'auth',
                        token:res.headers['x-auth']
                    });
                    done();
                }).catch((e)=>done(e));
            });
    });

    it('should reject invalid login',(done)=>{

        request(app)
            .post('/users/login')
            .send({
                email:userdata[1].email,
                password:userdata[1].password+'j'
            })
            .expect(400)
            .expect((res)=>{
                expect(res.headers['x-auth']).toNotExist();
            })
            .end((err,res)=>{
                if(err){
                    return done(err);
                }

                UserModel.findById(userdata[1]._id).then((user)=>{
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch((e)=>done(e));
            });
    });

});

describe('DELETE /users/me/token',()=>{

    it('should remove auth token on logout',(done)=>{

        request(app)
            .delete('/users/me/token')
            .set('x-auth',userdata[0].tokens[0].token)
            .expect(200)
            .end((err,res)=>{

                if(err)
                {
                    done(err);
                }

                UserModel.findById(userdata[0]._id).then((user)=>{

                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e)=>done(e));

            });

    });
});

