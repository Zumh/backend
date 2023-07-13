const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

/*
 * connection for url will different
 * unsuccessful and successful attempt
 * we get all the url from process environment
 *
 * */
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

/*
const noteSchema = new mongoose.Schema({
	content: String,
	important: Boolean,
});
*/

// create the schema with constrains
const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    minLength: 5,
    required: true
  },
  important: Boolean
})

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// public interface setting variable exports
// set the value to be Note model
// url and mongoose will not be accessible or visible
// to users of the module.
module.exports = mongoose.model('Note', noteSchema)

