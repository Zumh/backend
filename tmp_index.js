// important that dotenv gets imported before the note model is imported
// environment variables from .env file are available globally before the code fro the other modules is imported
require('dotenv').config();
const express =  require('express');
const app = express();
const cors = require('cors');
// importing module by using this 
const Note = require('./models/note');

const requestLogger = (request, response, next) => {
	console.log('Method:', request.method);
	console.log('Path: ', request.path);
	console.log('Body: ', request.body);
	console.log('---');
	next();
}

const errorHandler = (error, request, response, next) => {
	console.log(error.message);
	
	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' });

	next(error);

}

app.use(cors());
app.use(express.json());
app.use(express.static('build'));
app.use(requestLogger);
let notes  = [
        {
    id: 1,
    content: "HTML is easy",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]

// This is for mongoose 
/*
// mongoose is added 
const mongoose = require('mongoose')
const password = process.argv[2];
// DO NOT SAVE YOUR PASSWORD TO GITHUB!!
const url = `mongodb+srv://fullstack2023:${password}@cluster0.8vki2oh.mongodb.net/noteApp?retryWrites=true&w=majority`;

mongoose.set('strictQuery',false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})
const Note = mongoose.model('Note', noteSchema);

// delete all the version number and clone id
// convert them to to string first for safety
//
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

*/


/*
 * The event handler function accepts two parameters. The first request parameter contains all of the information of the HTTP request, and the second response parameter is used to define how the request is responded to.

In our code, the request is answered by using the send method of the response object. Calling the method makes the server respond to the HTTP request by sending a response containing the string <h1>Hello World!</h1> that was passed to the send method. Since the parameter is a string, express automatically sets the value of the Content-Type header to be text/html. The status code of the response defaults to 200.*/
app.get('/', (request, response) => {
	response.send('<h1>Hello World!</h1>');
});


// this will handle mongo db and we get data from database 
app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    	//console.log(notes);
	response.json(notes)
  })
});



// // http get requests for all notes
/*app.get('/api/notes', (request, response) => {
  response.json(notes)
})
*/

// Receiving data 
// express.json parse data into json format
// then we allow app.use to turn it into object.
/*
app.post('/api/notes', (request, response) => {
  
  const body = request.body;
  console.log(body);
  response.json(body);
})
*/

// Receiving data and accessing from database route handlers
app.post('/api/notes', (request, response) => {
	const body = request.body;
	if ( body.content === undefined) {
		return response.status(400).json({ error: 'content missing' });
	}

	const note = new Note({
		content: body.content, 
		important: body.important || false,
	})

	note.save().then(savedNote => {
		response.json(savedNote);
	})

});

// this is for fetching data from local notes from same server in render
// http get requests for individual note
/*app.get('/api/notes/:id', (request, response) => {
	const id = Number(request.params.id);
	// note.id === id mean matching only with same type of data
	// find that note
	const note = notes.find(note => note.id === id);
	
	if (note) {
		// if note do exist then we turn that note into json string and send back to client.
		response.json(note);
	} else {
		// otherwise we send the error code to client.
		response.status(404).end();
	}
})*/

app.get('/api/notes/:id', (request, response, next) => {
	Note.findById(request.params.id).then(note => {
		if (note) {
			response.json(note);
		} else {
			response.status(404).end();
		}
	
	})
	.catch(error => error => next(error));
	
	/*
	{
		//console.log(error);
		//response.status(500).end();
		//response.status(400).send({error: 'malformatted id'});
	});*/
});



// we can delete individual note by manual requesting
/*app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)

  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
})
*/

app.delete('/api/notes/:id', (request, response, next) => {
	Note.findByIdAndREmove(request.params.id)
	.then(result => {
		response.status(204).end();
	})
	.catch(error => next(error))
})

// generate id for notes 
const generatedId = () => {
  // if the length of the note is greater than 0 
  // get the max of end value and increment by one 
  // or else just return 0 
  // (...note.map(note => note.id)) mean extract all note id
  // ... made id number into individual numbers array.
  // that allow Math.max to find the larget id number.
  const maxId = notes.length > 0 ? Math.max(...notes.map(note => note.id)) : 0;
  return maxId + 1;
}

// adding new note 
app.post('/api/notes', (request, response) => {
  
	const body = request.body;
  	// if body is missing content then erturn error message	
	if (!body.content){
		return response.status(400).json({
			error: 'content missing'
		});
	}
	// prepare the note 
	const note = {
		content: body.content,
		important: body.important || false,
		id: generatedId(),
	}

	notes = notes.cocat(note);

	response.json(body);
	console.log(response);
})

app.use(unknownEndpoint);
// this middleware must be loaded at last.
app.use(errorHandler);

//const PORT = 3001 ; 
/*const PORT  = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
*/

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});






