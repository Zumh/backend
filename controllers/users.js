const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

// Router handler that returns all of the users in the database
usersRouter.get('/', async (request, response) => {
  // join query can be done with populate
  // we are now joining all the notes to users data
  // In addition to the field id:n we are now only interested in content and important.
  const users = await User
  // { content: 1, important: 1} means show content and important
    .find({}).populate('notes', { content: 1, important: 1 })
  //.find({}).populate('notes')

  response.json(users)
})

module.exports = usersRouter