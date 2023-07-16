// Import mongoose library
const mongoose = require('mongoose')

// Set up the MongoDB Atlas connection URI
const password = 'h45t041V88Gj06qJ' // Replace with your actual password
const url = `mongodb+srv://fullstack2023:${password}@cluster0.8vki2oh.mongodb.net/testNoteApp?retryWrites=true&w=majority`

// Connect to the MongoDB Atlas
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB')

    // Define the person schema
    const noteSchema = new mongoose.Schema({
      name: String,
      important: Boolean,
    })

    // Create the person model
    const Note = mongoose.model('notes', noteSchema)

    // Generate random data
    const getRandomBoolean = () => Math.random() < 0.5
    const getRandomName = () => {
      const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve']
      return names[Math.floor(Math.random() * names.length)]
    }

    // Save random data to the database
    const saveRandomData = async () => {
      try {
        for (let i = 0; i < 10; i++) {
          const randomName = getRandomName()
          const randomImportant = getRandomBoolean()

          const newNotes = new Note({
            name: randomName,
            important: randomImportant,
          })

          await newNotes.save()
          console.log(`Added ${randomName} to the phonebook`)
        }

        mongoose.connection.close()
      } catch (error) {
        console.error('Error saving data:', error)
        mongoose.connection.close()
      }
    }

    // Retrieve and display all data from the database
    const displayAllData = async () => {
      try {
        console.log('Notes:')
        const notes = await Note.find({})

        notes.forEach((currentNote) => {
          console.log(`${currentNote.name} ${currentNote.important}`)
        })

        mongoose.connection.close()
      } catch (error) {
        console.error('Error retrieving data:', error)
        mongoose.connection.close()
      }
    }

    // Choose the operation (save or display)
    const operation = process.argv[2] // Change to 'display' if you want to display data instead

    if (operation === 'save') {
      saveRandomData()
    } else if (operation === 'display') {
      displayAllData()
    } else {
      console.log('Invalid operation')
      mongoose.connection.close()
    }
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error)
  })

