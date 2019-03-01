/**
 * Main file to start the application
 * @author Henrique Deodato <devthegathering@apps.etc.br>
 */

const http = require('http');
const express = require('express');
const express_graphql = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();
const logger = require('morgan');
const helmet = require('helmet');
const bodyParser= require('body-parser');
const MongoClient = require('mongodb').MongoClient;

// load the data from env vars
require('dotenv-safe').load();

// ENDPOINTS
const routes = require('./routes'); // inside routes folder, get the index.js file

app.use(logger('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// load the individual configurations for the itens
const card = require('./routes/cards.js');

//single endpoint for graphQL
app.use('/graphql', express_graphql({
    schema: buildSchema(
        card.schema
    ),
    rootValue: {
        ...card.getRoot()
    },
    graphiql: true
}));

app.use(routes);

// connects do the database and create a global var to share the connection
MongoClient.connect( 
    process.env.MONGO_CONNECTION, 
    { useNewUrlParser: true }, 
    (err, database) => {
        if (err) return console.log(err)
        global.db = database.db( process.env.MONGO_DB ) // database name
        
        // create the server and start listening
        var server = http.createServer(app);
        // since we have a database connection, start the server...
        server.listen(3000);
});