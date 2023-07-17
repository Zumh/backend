const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')

const app = require('../app')

const api = supertest(app)

const Note = require('../models/note')





beforeEach(async () => {
  await Note.deleteMany({}) // clear the data
  let noteObject = new Note(helper.initialNotes[0]) // create a new object
  await noteObject.save() // then save it to database
  noteObject = new Note(helper.initialNotes[1])
  await noteObject.save()
})


//fetching an individual note
test('a specific note can be viewed', async () => {
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


// note can be deleted or remove
// delete the first note from collection of notes
test('a note can be deleted', async () => {
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



// the test basically trying to create boject in the atlas mongodb
test('a valid note can be added', async () => {
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
test('note without content is not added', async () => {
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

// In other words, supertest takes care that the application being tested is started at the port that it uses internally.

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



afterAll(async () => {
  await mongoose.connection.close()
})