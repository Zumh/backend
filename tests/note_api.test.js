const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Note = require('../models/note')

const initialNotes = [
  {
    content: 'HTML is easy',
    important: false,
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true,
  },
]

beforeEach(async () => {
  await Note.deleteMany({}) // clear the data
  let noteObject = new Note(initialNotes[0]) // create a new object
  await noteObject.save() // then save it to database
  noteObject = new Note(initialNotes[1])
  await noteObject.save()
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
  const response = await api.get('/api/notes')

  expect(response.body).toHaveLength(initialNotes.length)
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