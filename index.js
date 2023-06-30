const express =  require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.static('build'));

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
/*
 * The event handler function accepts two parameters. The first request parameter contains all of the information of the HTTP request, and the second response parameter is used to define how the request is responded to.

In our code, the request is answered by using the send method of the response object. Calling the method makes the server respond to the HTTP request by sending a response containing the string <h1>Hello World!</h1> that was passed to the send method. Since the parameter is a string, express automatically sets the value of the Content-Type header to be text/html. The status code of the response defaults to 200.*/
app.get('/', (request, response) => {
	response.send('<h1>Hello World!</h1>');
});

// // http get requests for all notes
app.get('/api/notes', (request, response) => {
  response.json(notes)
})


// Receiving data 
// express.json parse data into json format
// then we allow app.use to turn it into object.

app.post('/api/notes', (request, response) => {
  
  const body = request.body;
  console.log(body);
  response.json(body);
})

// http get requests for individual note
app.get('/api/notes/:id', (request, response) => {
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
})

// we can delete individual note by manual requesting
app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)

  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
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
})


//const PORT = 3001 ; 
const PORT  = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});




