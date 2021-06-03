require('dotenv').config();
const express = require("express");
const cors = require('cors');
const Note = require('./models/note');


const app = express();
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

// Remember: Middlewares work only when making a request
// Not when the application first starts
app.use(express.static('build'));
app.use(express.json());
app.use(requestLogger);
app.use(cors());


app.get('/', (request, response) => response.send("<h1>Hello World</h1>"));

app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => response.json(notes))
});

app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id)
        .then(note => {
            if (note) {
                response.json(note);
            }
            else {
                response.status(404).end();
            }
        })
        .catch(next);
});

app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id)
        .then(note => {
            if (note) {
                response.status(204).end();
            }

            response.status(409).send({
                error: `This resource does note exist or has been deleted`
            });
        })
        .catch(next);
});


app.post('/api/notes', (request, response, next) => {
    const body = request.body;

    if (!body.content) {
        return response.status(400).json({
            error: "content missing"
        });
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    })

    note.save()
        .then(savedNote => savedNote.toJSON())
        .then(formattedNote => response.json(formattedNote))
        .catch(next);
});


app.put('/api/notes/:id', (request, response, next) => {
    const body = request.body;
    if (body.content === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    const note = {
        content: body.content,
        important: body.important
    }

    Note.findByIdAndUpdate(request.params.id, note, { new: true })
        .then(updatedNote => {
            response.send(updatedNote);
        })
        .catch(next)
});


// Catching requests made to non-existent routes
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    }

    next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});