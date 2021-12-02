const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcrypt");

const app = require("../app");
const helper = require("./test_helper");
const Note = require("../models/note");
const User = require("../models/user");


const api = supertest(app);

beforeEach(async () => {
    await Note.deleteMany({});
    for (let note of helper.initialNotes) {
        let noteObject = new Note(note);
        await noteObject.save();
    }
});

describe("when there is initially some notes saved", () => {
    test("notes are returned as JSON", async () => {
        await api
            .get("/api/notes")
            .expect(200)
            .expect("Content-Type", /application\/json/);
    });

    test("all notes are returned", async () => {
        const response = await api.get("/api/notes");
        expect(response.body).toHaveLength(helper.initialNotes.length);
    });

    test("the first note is about HTTP methods", async () => {
        const response = await api.get("/api/notes");
        const contents = response.body.map(r => r.content);
        expect(contents).toContain("Browser can execute only Javascript");
    });
});

describe("when there is initially some notes saved", () => {
    test("a specific note can be viewed", async () => {
        const notesAtStart = await helper.notesInDb();
        const noteToVIew = notesAtStart[0];

        const resultNote = await api
            .get(`/api/notes/${noteToVIew.id}`)
            .expect(200)
            .expect("Content-Type", /application\/json/);


        const processedNoteToView = JSON.parse(JSON.stringify(noteToVIew));

        expect(resultNote.body).toEqual(processedNoteToView);
    });

    test("fails with statuscode 404 if note does not exist", async () => {
        const validNonExistingId = helper.nonExistingId();

        await api
            .get(`/api/notes/${validNonExistingId}`)
            .expect(404);
    });

    test("fails with statuscode 400 id is invalid", async () => {
        const invalidId = "60b5460ba56d3c171ffec47";

        await api
            .get(`/api/notes/${invalidId}`)
            .expect(400);
    });
});

describe("addition of a new note", () => {
    test("a valid note can be added", async () => {
        const newNote = {
            content: "async/await simplifies making async calls",
            important: true
        };

        await api
            .post("/api/notes")
            .send(newNote)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const notesAtEnd = await helper.notesInDb();
        expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1);

        const contents = notesAtEnd.map(n => n.content);
        expect(contents).toContain("async/await simplifies making async calls");
    });

    test("note without content is not added", async () => {
        const newNote = {
            important: true
        };

        await api
            .post("/api/notes")
            .send(newNote)
            .expect(400);

        const notesAtEnd = await helper.notesInDb();

        expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
    });
});

describe("deletion of a note", () => {
    test("a note can be deleted", async () => {
        const notesAtStart = await helper.notesInDb();
        const noteToDelete = notesAtStart[0];

        await api
            .delete(`/api/notes/${noteToDelete.id}`)
            .expect(204);

        const notesAtEnd = await helper.notesInDb();

        expect(notesAtEnd).toHaveLength(notesAtStart.length - 1);

        const contents = notesAtEnd.map(r => r.content);
        expect(contents).not.toContain(noteToDelete.body);
    });
});


describe("when there is initially one user in db", () => {
    beforeEach(async () => {
        await User.deleteMany({});

        const passwordHash = await bcrypt.hash("sekret", 10);
        const user = new User({ username: "root", passwordHash });

        await user.save();
    });

    test("creation succeeds with a fresh username", async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: "mluukkai",
            name: "Matti Luukkainen",
            password: "salainen",
        };

        await api
            .post("/api/users")
            .send(newUser)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

        const usernames = usersAtEnd.map(u => u.username);
        expect(usernames).toContain(newUser.username);
    });

    test("creation fails with proper statuscode and message if username already taken", async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: "root",
            name: "Superuser",
            password: "salainen",
        };

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/);

        expect(result.body.error).toContain("`username` to be unique");

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });
});


afterAll(() => {
    mongoose.connection.close();
});