const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3000;

app.use(express.json());


// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User and Places API',
      version: '1.0.0',
      description: 'An API for managing users and places',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local server',
      },
    ],
  },
  apis: ['./app.js'], // This points to your entry file (app.js)
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// / - returns json data: { "home": "Home page" }  
app.get('/', (req, res) => {
  res.json({ home: "Home page" });
});



// /index -> returns json data: { "hello": 'Hello World!' }
app.get('/index', (req, res) => {
  res.json({ hello: "Hello World!" });
});

// /data -> returns json data e.g.: [{ “id”: “1”, “Firstname”: “Jyri”, “Surname”: “Kemppainen”}, { “id”: “2”, “Firstname”: “Petri”, “Surname”: “Laitinen”}
const users = [
    { id: "1", Firstname: "Jyri", Surname: "Kemppainen" },
    { id: "2", Firstname: "Petri", Surname: "Laitinen" }
  ];

app.get('/data', (req, res) => {
    res.json(users);
});


// /data/1 returns data from the line identified by id no 1, /data/2 return data from the line id no 2, etc.
app.get('/data/:id', (req, res) => {
    const userId = req.params.id;
    const user = users.find(u => u.id === userId);
  
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
});


// /data request that can be used to add a new user (with the same field names: id, Firstname, Surname) if id number in the request does not already exist in the data. Check also that the request has the valid fields only, and if not inform the client with appropriate http status code and error message.
app.post('/data', (req, res) => {
    const { id, Firstname, Surname } = req.body;
  
    // In your server validate if the input data is supported by the server. The accepted data format is application/json. If the request is not valid, send the response with the status code 415 Unsupported Media Type.
    if (req.headers['content-type'] !== 'application/json') {
        return res.status(415).json({ error: "Unsupported Media Type. Content-Type must be application/json" });
    }
  
    if (!id || !Firstname || !Surname) {
      return res.status(400).json({ error: "Missing required fields: id, Firstname, Surname" });
    }
  
    if (Object.keys(req.body).length !== 3) {
      return res.status(400).json({ error: "Only id, Firstname, and Surname are allowed in the request body" });
  }

    if (users.some(user => user.id === id)) {
      return res.status(400).json({ error: "User with this ID already exists" });
    }
  
    const newUser = { id, Firstname, Surname };
    users.push(newUser);
    res.status(201).json(newUser);
});


let places = [
  { id: "1", name: "Central Park", location: "New York" },
  { id: "2", name: "Eiffel Tower", location: "Paris" }
];

app.delete('/places/:place_id', (req, res) => {
  const placeId = req.params.place_id;

  // Find the index of the place
  const index = places.findIndex(place => place.id === placeId);

  // If place is not found, return 404 Not Found
  if (index === -1) {
      return res.status(404).json({ error: "Place not found" });
  }

  // Remove the place from the array
  places.splice(index, 1);

  // Respond with 204 No Content as the place has been successfully deleted
  res.status(204).end();
});



// Define PUT endpoint for updating or creating a place
app.put('/places/:place_id', (req, res) => {
  const placeId = req.params.place_id;
  const { name, location } = req.body;

  // Validate Content-Type header
  if (req.headers['content-type'] !== 'application/json') {
    return res.status(415).json({ error: "Unsupported Media Type. Content-Type must be application/json" });
  }

  // Validate required fields
  if (!name || !location) {
    return res.status(400).json({ error: "Missing required fields: name, location" });
  }

  const existingPlaceIndex = places.findIndex(place => place.id === placeId);

  if (existingPlaceIndex !== -1) {
    // Update existing place
    places[existingPlaceIndex] = { id: placeId, name, location };
    return res.status(200).json(places[existingPlaceIndex]);
  } else {
    // Create a new place if it doesn't exist
    const newPlace = { id: placeId, name, location };
    places.push(newPlace);
    return res.status(201).json(newPlace);
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


module.exports = app;