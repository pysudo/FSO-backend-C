const Note = require("../models/note");
const User = require("../models/user");


const initialNotes = [
    {
        content: "HTML is easy",
        date: new Date(),
        important: false
    },
    {
        content: "Browser can execute only Javascript",
        date: new Date(),
        important: true
    }
];


const nonExistingId = () => {
    const note = new Note({ content: "willnotbeadded", date: new Date() });

    return note._id.toString();
};


const notesInDb = async () => {
    const notes = await Note.find({});

    return notes.map(note => note.toJSON());
};


const usersInDb = async () => {
    const users = await User.find({});
    return users.map(u => u.toJSON());
};


module.exports = {
    initialNotes,
    nonExistingId,
    notesInDb,
    usersInDb
};