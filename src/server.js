const http = require('http');

const PORT = 3000;

const app = require('./app');

const server = http.createServer(app);


server.listen(PORT , () => {
    console.log(`Listening on port ${PORT}`);
})