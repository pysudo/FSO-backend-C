const notesRouter = require("express").Router();
const jwt = require("jsonwebtoken");

const Note = require("../models/note");
const User = require("../models/user");


notesRouter.get("/", async (request, response) => {
    const notes = await Note
        .find({})
        .populate("user", { username: 1, name: 1 });
    response.json(notes);
});


notesRouter.get("/:id", async (request, response) => {
    const note = await Note.findById(request.params.id);
    if (note) {
        response.json(note);
    }
    else {
        response.status(404).end();
    }

});


notesRouter.delete("/:id", async (request, response) => {
    const deletedNote = await Note.findByIdAndDelete(request.params.id);
    if (!deletedNote) {
        return response.status(404).send({
            error: "This resource does note exist or has been deleted"
        });
    }
    response.status(204).end();

});


notesRouter.post("/", async (request, response) => {
    const body = request.body;
    const token = getTokenFrom(request);
    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: "token missing or invalid" });
    }


    const user = await User.findById(decodedToken.id);

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
        user: user._id
    });

    const savedNote = await note.save();
    user.notes = user.notes.concat(savedNote);
    await user.save();

    response.json(savedNote);
});




notesRouter.put("/:id", (request, response, next) => {
    const body = request.body;
    if (body.content === undefined) {
        return response.status(400).json({ error: "content missing" });
    }

    const note = {
        content: body.content,
        important: body.important
    };

    Note.findByIdAndUpdate(request.params.id, note, { new: true })
        .then(updatedNote => {
            response.send(updatedNote);
        })
        .catch(next);
});


const getTokenFrom = request => {
    const authorization = request.get("Authorization");

    if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
        return authorization.substring(7);
    }
    return null;
};


module.exports = notesRouter;