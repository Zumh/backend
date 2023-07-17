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
notesRouter.get('/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// saving data to mongo database
notesRouter.post('/', async (request, response, next) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,

  })
  try {
    // note.save()
    //   .then(savedNote => {
    //     // we return 201 status for crating status code
    //     response.status(201).json(savedNote)
    //   })
    //   .catch(error => next(error))
    const savedNote = await note.save()
    response.status(201).json(savedNote)
  } catch (exception){
    next(exception)
    /* The catch block simply calls the next function, which passes the request handling to the error handling middleware.*/
  }
})

// delete specific note by finding with id
notesRouter.delete('/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
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