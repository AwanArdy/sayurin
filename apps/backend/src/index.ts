import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
