const path = require("path");
const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const session = require('express-session');
const route = require("./routes");



app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: 'phuphan',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);


app.engine(
    "hbs",
    handlebars.engine({
      extname: ".hbs",
      defaultLayout: false
    })
);


app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources/views"));


route(app);

app.listen(port, () =>
  console.log(`http://localhost:${port}`)
);