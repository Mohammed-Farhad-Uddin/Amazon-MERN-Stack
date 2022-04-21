const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');


//uncaught Exception handle //such as console.log(facebook)..this is uncaught exception error
process.on('uncaughtException', (err) => {
    console.log(`Error:${err.message}`);
    console.log(`Shutting down the server due to unhandle uncaught exception`);
    process.exit(1);
});


//config
dotenv.config({ path: "backend/config/config.env" });


// Connect Database
connectDatabase();



const server = app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
});


//unhandle Promise Rejection //mongodb url e vul hole
process.on('unhandledRejection', (err) => {
    console.log(`Error:${err.message}`);
    console.log(`Shutting down the server due to unhandle promise rejection`);

    server.close(() => {
        process.exit(1);
    });
});

