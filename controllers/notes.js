/**
 * Router
 * A router object is an isolated instance of middleware and routes.
 * You can think of it as a “mini-application,” capable only of performing middleware and routing functions.
 * Every Express application has a built-in app router.
 */
const notesRouter = require('express').Router()
const Note = require('../models/note')

// get all the notes and response them to the frontend
notesRouter.get('/', async (request, response) => {
  // Note.find({}).then(notes => {
  //   response.json(notes)
  // })
  const notes = await Note.find({})
  response.json(notes)

})

// finding a note using id
notesRouter.get('/:id',  async (request, response) => {

  const note = await Note.findById(request.params.id)
  if(note){
    // if that single note do exist then response
    response.json(note)
  } else {
    // other wise just return 404 status code
    response.status(404).end()
  }


})

// saving data to mongo database
notesRouter.post('/', async (request, response) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,

  })


  const savedNote = await note.save()
  response.status(201).json(savedNote)

})

// delete specific note by finding with id
notesRouter.delete('/:id', async (request, response) => {

  // Because of the library, we do not need the next(exception) call anymore.
  // The library handles everything under the hood. If an exception occurs in an async route,
  // the execution is automatically passed to the error handling middleware.
  await Note.findByIdAndRemove(request.params.id)
  response.status(204).end()

})

// find the note using id and update info
notesRouter.put('/:id', (request, response, next) => {
  const { content, important } = request.body

  Note.findByIdAndUpdate(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

module.exports = notesRouter