
const knex = require('knex');
const app = require('../src/app');
const NotesService = require('../src/notes/notes-service');


describe(`Notes service object`, function() {
    let db
    let testNotes = [
        {
            "id": "d26e01a6-ffaf-11e8-8eb2-f2801f1b9fd1",
            "name": "Dogs",
            "modified": "2018-03-01T00:00:00.000Z",
            "folderId": "b07161a6-ffaf-11e8-8eb2-f2801f1b9fd1",
            "content": "Occaecati dignissimos quam qui facere deserunt quia. Quaerat aut eos laudantium dolor odio officiis illum. Velit vel qui dolorem et.\n \rQui ut vel excepturi in at. Ut accusamus cumque quia sapiente ut ipsa nesciunt. Dolorum quod eligendi qui aliquid sint.\n \rAt id deserunt voluptatem et rerum. Voluptatem fuga tempora aut dignissimos est odio maiores illo. Fugiat in ad expedita voluptas voluptatum nihil."
          },
          {
            "id": "d26e0570-ffaf-11e8-8eb2-f2801f1b9fd1",
            "name": "Birds",
            "modified": "2019-01-04T00:00:00.000Z",
            "folderId": "b0715efe-ffaf-11e8-8eb2-f2801f1b9fd1",
            "content": "Eum culpa odit. Veniam porro molestiae dolores sunt reiciendis culpa. Atque accusamus dolore eos odio facilis. Dolores reprehenderit et provident dolores possimus mollitia.\n \rAdipisci dolor necessitatibus nihil quod quia vel veniam. Placeat qui vero. Cum cum amet at nisi. Distinctio rerum similique explicabo atque ratione. Recusandae omnis earum est. Quas iusto nihil itaque architecto ea.\n \rPerferendis neque doloremque quibusdam accusantium ut dolor illum dolorum. Vero et similique nihil beatae. In repellendus dolores praesentium. Optio alias rerum culpa placeat maiores natus sed. Ipsa et qui cum ex maiores."
          },
          {
            "id": "d26e0714-ffaf-11e8-8eb2-f2801f1b9fd1",
            "name": "Bears",
            "modified": "2018-07-12T23:00:00.000Z",
            "folderId": "b0715efe-ffaf-11e8-8eb2-f2801f1b9fd1",
            "content": "Distinctio dolor nihil ad iure quo tempore id ipsum. Doloremque sunt dicta odit. Id veritatis aut et doloremque natus.\n \rDeleniti temporibus repellendus molestias nemo. Cupiditate quae consectetur. Reiciendis corporis maxime consequatur qui quaerat cum aut. Quia officiis aut.\n \rAsperiores aut culpa voluptatem amet accusantium officia. Et et et adipisci ullam nesciunt eum magni totam. Quae repellendus suscipit animi vel laudantium sed enim nulla esse. Cupiditate quos minus laudantium autem eum quas tempore. Eos quibusdam quibusdam. Voluptatem molestiae qui accusamus blanditiis voluptates quia."
          },
          {
            "id": "d26e0854-ffaf-11e8-8eb2-f2801f1b9fd1",
            "name": "Horses",
            "modified": "2018-08-20T23:00:00.000Z",
            "folderId": "b07161a6-ffaf-11e8-8eb2-f2801f1b9fd1",
            "content": "Aliquid magnam ut quis quas impedit molestiae laudantium adipisci et. Officiis ut dolor rerum molestiae. Natus rerum libero aperiam. Rem aut consequatur. Quas soluta modi rerum id qui quis et voluptatem perferendis.\n \rIpsum quod sed minima rerum. Voluptatem pariatur voluptatem iure. Voluptatem perferendis qui doloremque distinctio nobis praesentium corrupti unde sed.\n \rPlaceat deleniti in praesentium aut tenetur. Recusandae debitis sint voluptates quam sed eum et quos qui. Atque esse nostrum et architecto qui perspiciatis odit aut. Aut quis corrupti ut. Maiores ratione sit dolor consectetur eius iusto illo sequi. Mollitia fugit dolores."
          },
    ]
    
    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    })

    before(() => db('notes').truncate())

    before(() => {
        return db
            .into('notes')
            .insert(testNotes)
    })
    app.set('db', db)

    after(() => db.destroy())
})

describe(`getAllNotes()`, () =>{
    it(`resolves all notes from 'notes' table`, () =>{
        return NotesService.getAllNotes(db)
            .then(actual => {
                expect(actual).to.eql(testNotes)
            })
    })
})