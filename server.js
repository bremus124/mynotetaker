const express = require('express');
const notes = require('./db/db.json');
const fs = require('fs');
const path = require('path');
const { query } = require('express');
const { resourceLimits } = require('worker_threads');
const { v4: uuidv4 } = require('uuid');



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
    const note = {
        "title":body.title, 
        "text":body.text,
        "id": uuidv4()
    }
    notesarray.push(note)
    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify(notesarray)
    )
    return note
}


function deleteNote(id,notesarray){
    for (let i = 0; i<notesarray.length; i++){
        if (notesarray[i].id === id){
            notesarray.splice(i,1);
            fs.writeFileSync(
                path.join(__dirname, './db/db.json'),
                JSON.stringify(notesarray)    
            )
          return true; 
        }
    }
        return false;
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
    const note = createnote(req.body, notes)
    res.json(note)
})

app.delete('/api/notes/:id', (req, res) => {
    if (deleteNote(req.params.id, notes)){
        return res.status(200).json(`note was removed successfully!`);    
    }
    else {
        return res.status(500).json('Error in deleting Note');
    }
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