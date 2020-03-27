const { expect } = require('chai')
const knex = require('knex');
const app = require('../src/app');
const fixtures = require('./noteful-fixtures')


describe('Noteful Endpoints', () => {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))


  describe('GET /api/folders', () => {
    context(`Given no folders`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, [])
      })
    })

    context('Given there are folders in the database', () => {
      const testFolders = fixtures.makeFoldersArray()

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
      })

      it('gets the folders from the store', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, testFolders)
      })
    })

    context(`Given an XSS attack bookmark`, () => {
      const { maliciousFolder, expectedFolder } = fixtures.makeMaliciousFolder()

      beforeEach('insert malicious bookmark', () => {
        return db
          .into('folders')
          .insert([maliciousFolder])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/folders`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedFolder.name)
          })
      })
    })
  })



  describe('GET /api/notes', () => {
    context(`Given no notes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, [])
      })
    })

    context('Given there are notes in the database', () => {
      const testNotes = fixtures.makeNotesArray()
  
      
      beforeEach('insert notes', () => {
        return db
          .into('notes')
          .insert(testNotes)
      })

      it('gets the notes from the store', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, testNotes)
      })
    })

    context(`Given an XSS attack note`, () => {
      const { maliciousNote, expectedNote } = fixtures.makeMaliciousNote()
      const testFolders = fixtures.makeFoldersArray()

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
      })
      
      beforeEach('insert malicious note', () => {
        return db
          .into('notes')
          .insert([maliciousNote])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/notes`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedNote.name)
          })
      })
    })
  })
  

  describe('GET /api/notes/:id', () => {
    context(`Given no note`, () => {
      it(`responds 404 when note doesn't exist`, () => {
        return supertest(app)
          .get(`/api/notes/123`)
          .expect(404)
      })
    })

    context('Given there are notes in the database', () => {
      const testNotes = fixtures.makeNotesArray()

      beforeEach('insert notes', () => {
        return db
          .into('notes')
          .insert(testNotes)
      })

      it('responds with 200 and the specified bookmark', () => {
        const noteId = 2
        const expectedNote = testNotes[noteId - 1]
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(200, expectedNote)
      })
    })

    context(`Given an XSS attack bookmark`, () => {
      const { maliciousNote, expectedNote } = fixtures.makeMaliciousNote()

      beforeEach('insert malicious bookmark', () => {
        return db
          .into('notes')
          .insert([maliciousNote])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/notes/${maliciousNote.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.eql(expectedNote.name)
            expect(res.body.content).to.eql(expectedNote.content)
          })
      })
    })
  })
  

  describe('DELETE /api/notes/:id', () => {
    context(`Given no notes`, () => {
      it(`responds 404 when note doesn't exist`, () => {
        return supertest(app)
          .delete(`/api/notes/123`)
          .expect(404)
      })
    })

    context('Given there are notes in the database', () => {
      const testNotes = fixtures.makeNotesArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('notes')
          .insert(testNotes)
      })

      it('removes the note by ID from the store', () => {
        const idToRemove = 2
        const expectedNotes = testNotes.filter(bm => bm.id !== idToRemove)
        return supertest(app)
          .delete(`/api/notes/${idToRemove}`)
          .expect(204)
          .then(() =>
            supertest(app)
              .get(`/api/notes`)
              .expect(expectedNotes)
          )
      })
    })
  })

  describe('POST /api/folders', () => {
    ['name'].forEach(field => {
      const newFolder = {
        name: 'test-name',
      }

      it(`responds with 400 missing '${field}' if not supplied`, () => {
        delete newFolder[field]

        return supertest(app)
          .post(`/api/folders`)
          .send(newFolder)
          .expect(400)
      })
    })


    it('adds a new folder to the list', () => {
      const newFolder = {
        name: 'test-name',
      }
      return supertest(app)
        .post(`/api/folders`)
        .send(newFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newFolder.name)
          expect(res.body).to.have.property('id')
        })
        .then(res =>
          supertest(app)
            .get(`/api/folders/${res.body.id}`)
            .expect(res.body)
        )
    })

    it('removes XSS attack content from response', () => {
      const { maliciousFolder, expectedFolder } = fixtures.makeMaliciousFolder()
      return supertest(app)
        .post(`/api/folders`)
        .send(maliciousFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(expectedFolder.name)
        })
    })
  })

  
}) 