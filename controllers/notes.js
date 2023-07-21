/**
 * Router
 * A router object is an isolated instance of middleware and routes.
 * You can think of it as a “mini-application,” capable only of performing middleware and routing functions.
 * Every Express application has a built-in app router.
 */
const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

// get all the notes and response them to the frontend
notesRouter.get('/', async (request, response) => {

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
 
  // find the user base on their id
  const user = await User.findById(body.userId)

  // create a new note with user id as a reference
  const note = new Note({
    content: body.content,
    important: body.important === undefined ? false : body.important,

    user: user.id

  })


  const savedNote = await note.save()

  // also we extract and concatenate the note id to user object
  // assign all the notes object to user.notes
  user.notes = user.notes.concat(savedNote._id)
  // we saved the user with the note and id
  await user.save()

  // we only return savedNote
  response.json(savedNote)
  //response.status(201).json(savedNote)

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
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})



module.exports = notesRouter