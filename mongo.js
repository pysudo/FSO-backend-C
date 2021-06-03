const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>');
    process.exit(1);
}

const password = process.argv[2];

let url = `mongodb+srv://bearsterns:${password}@cluster0.llzrs.mongodb.net/`;
url += "note-app?retryWrites=true&w=majority`";

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean,
});

const Note = mongoose.model('Note', noteSchema);

// const note = new Note({
//     content: 'Sven Snusberg',
//     date: new Date(),
//     important: true,
// })

// note.save().then(result => {
//     console.log('note saved!,', result)
//     mongoose.connection.close()
// })

Note.find({}).then(result => {
    result.forEach(note => {
        console.log(note)
    })
    mongoose.connection.close()
});