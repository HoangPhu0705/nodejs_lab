const express = require("express");
const app = express();
const path = require("path");
const handlebars = require("express-handlebars");
const port = 3000;
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
require("dotenv").config();
const PORT = process.env.PORT;
const URL = process.env.URL;
const TOKEN = process.env.TOKEN;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine(
    "hbs",
    handlebars.engine({
        extname: ".hbs",
        defaultLayout: false,
    })
);

// [GET User]
async function fetchUsers() {
    try {
        let users = [];
        for (let page = 1; page <= 6; page++) {
            const response = await fetch(
                `https://gorest.co.in/public/v2/users?page=${page}`
            );
            const data = await response.json();
            users = users.concat(data);
        }
        return users;
    } catch (err) {
        console.error(err);
    }
}

//Pagination
function paginate(array, page_size, page_number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

app.get("/public-api/users", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const allUsers = await fetchUsers();
    const users = paginate(allUsers, limit, page);
    res.render("index", { users });
});

app.post("/public-api/users", async (req, res) => {
    const userData = req.body;


    const response = await fetch(URL + "/public/v2/users", {
        method: "POST",
        body: JSON.stringify(userData),
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + TOKEN,
        },
    });
    const data = await response.json();

    if (response.ok) {
        res.status(201).send(data);
    } else {
        res.status(response.status).send(data);
    }
});

app.get("/public-api/users/:id", async (req, res) => {
    const userid = req.url.split("/users/")[1];
    const response = await fetch(
        `https://gorest.co.in/public/v2/users/${userid}`
    );
    const user = await response.json();
    res.render("profile", { user });
});



app.delete("/public-api/users/:id", async (req, res) => {
    const userid = req.url.split("/users/")[1];
    const response = await fetch(
        `https://gorest.co.in/public/v2/users/${userid}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + TOKEN,
            },
        }
    );
    if (response.ok) {
        res.redirect('back');
    } else {
        const data = await response.json();
    }
});

app.put("/public-api/users/:id", async (req, res) =>{
    const userid = req.url.split("/users/")[1];
    console.log(userid);
    const userdata = req.body;
    const response = await fetch(`https://gorest.co.in/public/v2/users/${userid}`, {
        method: "PUT",
        body: JSON.stringify(userdata),
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + TOKEN,
        },
    });

    const data = await response.json();

    if (response.ok) {
        console.log(`Update user with id ${userid}`)
        res.status(201).send(data);
    } else {
        res.status(response.status).send(data);
    }
});


app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources/views"));
app.listen(port, () => console.log(`http://localhost:${port}`));
