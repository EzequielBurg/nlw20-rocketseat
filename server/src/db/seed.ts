import { reset, seed } from 'drizzle-seed'
import { db, sql } from './connection'
import { schema } from './schema'

await reset(db, schema)

await seed(db, schema).refine(file => {
  return {
    rooms: {
      count: 20,
      columns: {
        name: file.companyName(),
        description: file.loremIpsum(),
      },
    },
    questions: {
      count: 20
    }
  }
})

await sql.end()

console.log('database seeded');
