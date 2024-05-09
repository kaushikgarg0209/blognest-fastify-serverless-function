import Fastify from 'fastify'
import { Pool } from 'pg';
import dotenv from 'dotenv';
import cors from '@fastify/cors'

dotenv.config();
const app = Fastify({
  logger: true,
})

app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

app.get('/', async (req, reply) => {
  return reply.status(200).type('text/html').send(html)
})

app.get('/all-blogs', async (request, reply) => {
  try {
      const result = await pool.query('SELECT * FROM blogs');
      const blogs = result.rows;
      reply.send({ blogs });
  } catch (error) {
      console.error(error);
      reply.status(500).send({ message: 'Internal server error' });
  }
});

app.post('/add-blog', async (request, reply) => {
  try {
    const { title, shortDescription, description, imageUrl, category, username, publishtime} = request.body;

    await pool.query(
      'INSERT INTO blogs (title, shortdescription, description, imageurl, category, username, publishtime) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [title, shortDescription, description, imageUrl, category, username, publishtime]
    );

    reply.send({ message: 'Blog posted successfully' });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: 'Internal server error' });
  }
});


app.delete('/delete-blog', async (request, reply) => {
  try {
    const blogid = request.headers['blogid'];

    await pool.query(
      'DELETE FROM blogs WHERE blogid = $1',
      [blogid]
    );

    reply.send({ message: 'Deleted successfully' });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: 'Internal server error' });
  }
});

app.get('/get-blog', async (request, reply) => {
  try {
    const id = request.headers['id'];

    const result = await pool.query(
      'SELECT * FROM blogs WHERE blogid = $1',
      [id]
    );

    const blogs = result.rows;
    reply.send({ blogs });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: 'Internal server error' });
  }
});

app.get('/get-blogs', async (request, reply) => {
  try {
    const category = request.headers['category'];
    const value = category ? category.charAt(0).toUpperCase() + category.slice(1) : undefined;

    const result = await pool.query(
      'SELECT * FROM blogs WHERE category = $1',
      [value]
    );

    const blogs = result.rows;
    reply.send({ blogs });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: 'Internal server error' });
  }
});

app.put('/update-blog', async (request, reply) => {
  try {
    const data = request.body;
    const { id, title, shortDescription, description, imageUrl, category } = data;

    const result = await pool.query(
      'UPDATE blogs SET title = $1, shortdescription = $2, description = $3, imageurl = $4, category = $5 WHERE blogid = $6',
      [title, shortDescription, description, imageUrl, category, id]
    );

    reply.send({ message: 'Blog updated successfully' });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: 'Internal server error' });
  }
});

export default async function handler(req, reply) {
  await app.ready()
  app.server.emit('request', req, reply)
}

const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css"
    />
    <title>Vercel + Fastify Hello World</title>
    <meta
      name="description"
      content="This is a starter template for Vercel + Fastify."
    />
  </head>
  <body>
    <h1>Vercel + Fastify Hello World</h1>
    <p>
      This is a starter template for Vercel + Fastify. Requests are
      rewritten from <code>/*</code> to <code>/api/*</code>, which runs
      as a Vercel Function.
    </p>
    <p>
        For example, here is the boilerplate code for this route:
    </p>
    <pre>
<code>import Fastify from 'fastify'

const app = Fastify({
  logger: true,
})

app.get('/', async (req, res) => {
  return res.status(200).type('text/html').send(html)
})

export default async function handler(req: any, res: any) {
  await app.ready()
  app.server.emit('request', req, res)
}</code>
    </pre>
    <p>
    <p>
      <a href="https://vercel.com/templates/other/fastify-serverless-function">
      Deploy your own
      </a>
      to get started.
  </body>
</html>
`
