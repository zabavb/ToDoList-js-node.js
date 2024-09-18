const express = require('express');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const PORT = 3000;
const DB_URL = "mongodb://...";
const Schema = mongoose.Schema;
const app = express();
// const jsonParser = express.json();
app.use(express.static('views'));

const TaskSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            maxlength: 32
        },
        description: {
            type: String,
            maxlength: 128
        },
        dateStart: {
            type: Date,
            default: Date.now()
        },
        dateEnd: {
            type: Date,
            default: Date.now()
        }
    },
    { versionKey: false }
);
app.use(express.json());
const Task = mongoose.model('Task', TaskSchema);
const main = async function () {
    try {
        await mongoose.connect(DB_URL);
        app.listen(PORT);
    }
    catch (err) {
        return console.log(err);
    }
}
main();
// SELECT *
app.get('/api/tasks', async function (request, response) {
    try {
        const tasks = await Task.find({});

        tasks.forEach(element => {
            element.id = element._id.toString();
        });

        response.send(tasks);
    }
    catch (err) {
        response.sendStatus(500);
    }
});
// SELECT by "name"
app.get('/api/tasks/:name', async function (request, response) {
    try {
        const task = await Task.findOne({ name: request.params.name });

        if (task)
            response.send(task);
        else
            response.send(new Task({ name: request.params.name, description: "Was not found!", }));
    }
    catch (err) {
        response.sendStatus(500);
    }
});
// INSERT
app.post('/api/tasks', async function (request, response) {
    if (!request.body)
        return response.sendStatus(400);
    try {
        const task = new Task({
            name: request.body.name,
            description: request.body.description,
            dateStart: request.body.dateStart,
            dateEnd: request.body.dateEnd
        });
        task.save();

        response.status(201);
        response.send(task);
    }
    catch (err) {
        response.sendStatus(500);
    }
});
// UPDATE
app.put('/api/tasks/:id', async function (request, response) {
    if (!request.body)
        return response.sendStatus(400);
    try {
        const newTask = {
            name: request.body.name,
            description: request.body.description,
            dateStart: request.body.dateStart,
            dateEnd: request.body.dateEnd
        };
        const task = await Task.findOneAndUpdate({ _id: new ObjectId(request.params.id) }, newTask, { new: true });

        if (task)
            response.send(task);
        else
            response.sendStatus(404);
    }
    catch (err) {
        response.sendStatus(500);
    }
});
// DELETE
app.delete('/api/tasks/:id', async function (request, response) {
    try {
        const id = new ObjectId(request.params.id);
        const task = await Task.findByIdAndDelete({ _id: id });

        if (task)
            response.send(task);
        else
            response.sendStatus(404);
    }
    catch (err) {
        response.sendStatus(500);
    }
});

process.on('SIGINT', async function () {
    await mongoose.disconnect();
    process.exit();
})