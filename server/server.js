const express = require('express');
const pool = require('./dbconnect');
const bcrypt = require('bcrypt');
const multer = require('multer');
require('dotenv').config();
const app = express();
const { expressjwt: ejwt } = require("express-jwt");
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const SECRET_KEY = process.env.JWT_SECRET;
const PORT = 8181;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/images/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomUUID()}`)
});

const images = multer({ storage });

function fromCookie(req) {
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  return null;
}

function fromRefreshCookie(req) {
  if (req.cookies && req.cookies.refreshToken) {
    return req.cookies.refreshToken;
  }
  return null;
}

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});

app.use([express.json(), cookieParser()]);

app.use(cors({
  origin: 'http://localhost:8180', // Replace with Angular URL
  credentials: true
}));

// Define a basic GET route
app.get('/', (req, res) => {
  res.json('v1.0.0');
});

app.get('/auth/state', (req, res) => {
  try {
    let accessToken = jwt.verify(req.cookies.accessToken, SECRET_KEY);
    if (accessToken) {
      res.json({ state: 1 });
    }
  } catch (err) {
  }
  try {
    let refreshToken = jwt.verify(req.cookies.refreshToken, SECRET_KEY);
    if (refreshToken) {
      res.json({ state: 2 });
    }
  } catch (err) {
  }
  res.json({ state: 3 });
});

app.post('/auth/signup/', async (req, res) => {
  let client;
  
  try {
    client = await pool.connect();

    let clientPass = req.body.password;
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const clientHash = await bcrypt.hash(clientPass, salt);

    let sql = `
    INSERT INTO users (name, email, password)
    VALUES
    ($1, $2, $3);`;

    const insert = await client.query(sql, [req.body.username, req.body.email, clientHash]);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: err });
  } finally {
    if (client) client.release();
  }
});

app.post('/auth/login/', async (req, res) => {
  let client;
  
  try {
    client = await pool.connect();
    let sql = `SELECT id, password, verified FROM users where email = $1`
    let hashPass = await client.query(sql, [req.body.email]);

    let clientPass = req.body.password;

    if (hashPass.rowCount == 0) {
      throw new Error('Wrong email or password.');
    }
    const passMatch = await bcrypt.compare(clientPass, hashPass.rows[0].password);
    if (passMatch) {
      if (hashPass.rows[0].verified) {
        const accessToken = jwt.sign({ userid: hashPass.rows[0].id }, SECRET_KEY, { algorithm: 'HS256', expiresIn: '1h' });
        const refreshToken = jwt.sign({ userid: hashPass.rows[0].id }, SECRET_KEY, { algorithm: 'HS256', expiresIn: '7d' });

        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60
        });

        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 * 24 * 7
        });

        res.json({ status: 'ok' });
      } else {
        throw new Error('User not verified.');
      }
    } else {
      throw new Error('Wrong email or password.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.error });
  } finally {
    if (client) client.release();
  }
});

app.get('/auth/logout/', async (req, res) => {
  res.cookie('accessToken', '', {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 0
  });

  res.cookie('refreshToken', '', {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 0
  });

  res.json({ status: 'ok'});
});

app.get('/auth/refresh/', ejwt({ secret: SECRET_KEY, algorithms: ["HS256"], getToken: fromRefreshCookie }), async (req, res) => {
  let verified = jwt.verify(req.cookies.refreshToken, SECRET_KEY);
  const accessToken = jwt.sign({ userid: verified.userid }, SECRET_KEY, { algorithm: 'HS256', expiresIn: '1h' });
  const refreshToken = jwt.sign({ userid: verified.userid }, SECRET_KEY, { algorithm: 'HS256', expiresIn: '7d' });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 * 7
  });

  res.json({ status: 'ok' });
});

app.get('/recipes/', async (req, res) => {
  
  let client;
  try {
    client = await pool.connect();

    let sqlQuery = `SELECT 
    r.*,
    COALESCE(json_agg(t) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
    FROM 
        recipes AS r
    LEFT OUTER JOIN 
        recipesXtags rxt ON r.id = rxt.recipeid
    LEFT OUTER JOIN
        tags t ON rxt.tagid = t.id
    GROUP BY 
        r.id, r.name
    ORDER BY
      r.id asc;`;

    let result = await client.query(sqlQuery);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.error });
  } finally {
    if (client) client.release();
  }
});

app.get('/recipes/:id', async (req, res) => {
  let id = req.params.id
  try{
    let num = Number(id);
    if (Number.isNaN(num) || num == 0) {
      res.status(400).json({ error: 'Not a valid id.' });
    }
  } catch (err) {
    // eat it
  }
  
  let client;
  try {
    client = await pool.connect();

    let sqlQuery = `SELECT 
    r.*,
    COALESCE(json_agg(t) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
    FROM 
        recipes AS r
    LEFT OUTER JOIN 
        recipesXtags rxt ON r.id = rxt.recipeid
    LEFT OUTER JOIN
        tags t ON rxt.tagid = t.id
    WHERE 
        r.id = $1
    GROUP BY 
        r.id, r.name
    ORDER BY
      r.id asc;`;

    let result = await client.query(sqlQuery, [req.params.id]);
    
    if (result.rowCount == 0) {
      res.status(404).json({ error: 'No recipe found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.error });
  } finally {
    if (client) client.release();
  }
});

app.post('/recipes/add/', ejwt({ secret: SECRET_KEY, algorithms: ["HS256"], getToken: fromCookie }), async (req, res) => {
  let client;
  try {
    client = await pool.connect();

    let recipe = req.body;

    let sqlInsertRecipe = `
    INSERT INTO recipes (name, image, description)
    VALUES
    ($1, $2, $3);
    `;

    let sqlGetRecipes = `
    SELECT 
    r.*,
    COALESCE(json_agg(t) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
    FROM 
        recipes AS r
    LEFT OUTER JOIN 
        recipesXtags rxt ON r.id = rxt.recipeid
    LEFT OUTER JOIN
        tags t ON rxt.tagid = t.id
    GROUP BY 
        r.id, r.name
    ORDER BY
      r.id asc;`;
    
    const insert = await client.query(sqlInsertRecipe, [recipe.name, recipe.image, recipe.description]);
    const result = await client.query(sqlGetRecipes);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.error });
  } finally {
    if (client) client.release();
  }
});

app.post('/images/add/', ejwt({ secret: SECRET_KEY, algorithms: ["HS256"], getToken: fromCookie }), images.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No valid image to upload.');
  }

  console.log(req.file.path);
  res.json(req.file.path);
});

/*app.get('/users/', async (req, res) => {
  let client;
  try {
    client = await pool.connect();

    const result = await client.query('SELECT * FROM users');

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.error });
  } finally {
    if (client) client.release();
  }
});*/

// Start the server
app.listen(PORT, () => {});