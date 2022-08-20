const express = require('express');
const {notes} = require('./db/db.json');
const fs = require('fs');
const path = require('path');
const { query } = require('express');
const { resourceLimits } = require('worker_threads');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('public'))

function filterbyquery(query, notesarray){
    let filterresults = notesarray
    if (query.title) {
        filterresults = filterresults.filter ((note) => note.title === query.title)
    }
    return filterresults
}

function createnote(body, notesarray){
    const note = body
    notesarray.push(note)
    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify({notes: notesarray}, null, 2),
    )
    return note
}

function findById(id, notesarray) {
    const result = notesarray.filter((notes) => notes.id === id)
    return result
}

app.get('/api/notes/:id', (req, res) => {
    const result = findById(req.params.id, notes)
    if (result) {
        res.json(result)
    } else {
        res.send(404)
    }
})

app.get('/api/notes', (req, res) => {
    let results = notes
    if (req.query) {
        results = filterbyquery (req.query, results)
    }
    res.json(results)
})

app.post('/api/notes', (req, res) => {
    req.body.id = notes.length.toString()
    const note = createnote(req.body, notes)
    res.json(note)
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'))
})
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'))
})
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'))
})

app.listen(PORT, () => {
    console.log(`serveronPORT ${PORT}`)
})