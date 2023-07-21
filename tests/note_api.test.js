const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')

const app = require('../app')

const api = supertest(app)

const User = require('../models/user')
const Note = require('../models/note')

// nested multiple async can be a mess and beforEach doesn't wait for nested wait
// we can use Promise.all for this issue
// Promise.all will wait until all the datas are saved in the database




describe('when there is initially some notes saved', () => {
  // In other words, supertest takes care that the application being tested is started at the port that it uses internally.
  
  beforeEach(async () => {
    await Note.deleteMany({})
    await Note.insertMany(helper.initialNotes)

  })

  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    // above application/json compare http get request from the header
    // The actual value of the header is application/json; charset=utf-8
  }, 100000) // we at the ms for timeout to ensures that our test won't fail
  // we can set timeout at the time for mongoose
  // mongoose.set("bufferTimeoutMS", 30000)

  test('all notes are returned', async () => {

    // we make get requests
    const response = await api.get('/api/notes')
    // we make sure requested data have x amount of length, just like original length.
    expect(response.body).toHaveLength(helper.initialNotes.length)
  })

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes')

    const contents = response.body.map(r => r.content)
    expect(contents).toContain(
      'Browser can execute only JavaScript'
    )
  })

})


describe('viewing a specific note', () => {

  //fetching an individual note
  test('success with a valid id', async () => {
    const notesAtStart = await helper.notesInDb()

    // first note from collection of notes
    const noteToView = notesAtStart[0]

    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    // compare the result body and noteToview
    expect(resultNote.body).toEqual(noteToView)
  })

  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/notes/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/notes/${invalidId}`)
      .expect(400)
  })


})

describe('addition of a new note', () => {
// the test basically trying to create boject in the atlas mongodb
  test('success with valid data', async () => {
    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true,
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    // we expect the response body should be more than one
    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)

    // extract the contents from reponse from api/notes collections
    const contents = notesAtEnd.map(r => r.content)

    // compare the content that we retrieve from response
    expect(contents).toContain('async/await simplifies making async calls')
  })

  // here we going to try to add empty note to data base
  // we expect to fail so that it will be the same size of length from response and initialNotes.
  test('Updating fails with status code 400 if data invalid', async () => {
    const newNote = {
      important: true
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(400)

    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
  })

})


describe('deletion of a note', () => {

  // note can be deleted or remove
  // delete the first note from collection of notes
  test('Deleting succeeds with status code 204 if id is valid', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToDelete = notesAtStart[0]

    await api
      .delete( `/api/notes/${noteToDelete.id}`)
      .expect(204)

    const notesAtEnd = await helper.notesInDb()

    expect(notesAtEnd).toHaveLength(
      helper.initialNotes.length -1
    )

    const contents = notesAtEnd.map(r => r.content)
    expect(contents).not.toContain(noteToDelete.content)
  })


})


describe('when there is intially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })

  // creating a dabase with password
  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }
    // send the new object to database and saved there
    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    // query the data using mongodb
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    // verify them with current user names
    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  // verifies that a new user with the same username can not be created
  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    // let's try to insert with same user name but the model said it must be unique
    // so we are not allow and it return 400 status code
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique' )

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
    //expect(usersAtEnd).toHaveLength(usersAtStart.length)

  })
})



afterAll(async () => {
  await mongoose.connection.close()
})