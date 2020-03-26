const path = require('path')
const express = require('express')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

notesRouter
  .route('/')
  .get((req, res, next) => {
    NotesService.getAllNotes(
        req.app.get('db')
    )
      .then(notes => {
        res.json(notes)
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { name, content, folderId } = req.body
    const newNote = { name, content, folderId }

    for (const [key, value] of Object.entries(newNote)) {
             if (value == null) {
               return res.status(400).json({
                 error: { message: `Missing '${key}' in request body` }
               })
             }
    }
    NotesService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(note)
      })
      .catch(next)
  })


  notesRouter
  .route('/:note_id')
  .delete((req, res, next) => {
    NotesService.deleteNote(
             req.app.get('db'),
             req.params.note_id
           )
             .then(() => {
               res.status(204).json()
             })
             .catch(next)
  })
  

module.exports = notesRouter