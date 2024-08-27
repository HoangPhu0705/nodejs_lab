const accountRouter = require('./AccountRouter');
const fileRouter = require('./FileRouter');

function route(app){
    app.use('/', accountRouter);
    app.use('/', fileRouter);
}

module.exports = route;