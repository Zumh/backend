// import mongoose library
const mongoose = require('mongoose');

// check if the argument have password that we can use it for accessing MongoDB from internet
if (process.argv.length<3) {
	console.log('give password as argument');
	process.exit(1);
}

const password = process.argv[2];

// this is url that we can use for URI from mongodb
const url = `mongodb+srv://fullstack2023:${password}@cluster0.8vki2oh.mongodb.net/noteApp?retryWrites=true&w=majority`;

// make it less strictQuery for simplicity sake
mongoose.set('strictQuery', false);
mongoose.connect(url);

// and make that structure or the schema string and boolean
const noteSchema = new mongoose.Schema({
	content: String,
	important: Boolean,
});

// set the mongoo db with Note
const Note = mongoose.model('Note', noteSchema);


// create a new data 
const note = new Note({
	content: 'HTML is Easy',
	important: true,
});

// make sure the data is save and close
note.save().then(result => {
	console.log('note saved!');
	mongoose.connection.close();
});


/*
// extracting notes from database
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})*/
