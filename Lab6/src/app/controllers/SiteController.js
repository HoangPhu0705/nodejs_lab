const path = require('path');   
const userService = require('../../services/UserService');


class SiteController{
    async index(req, res) {
        if (!req.session.user) {
            res.redirect('/login');  
            return;
        }

        const userId = req.session.user.id;
        userService.getUserFiles(userId)
            .then(data => {
                res.render('index', { user: req.session.user, directories: data.directories, files: data.files });
            })
            .catch(err => {
                console.log('Error fetching files: ' + err);
                res.status(500).send(err);
            });
    }

    login(req, res) {
        res.render('login');
    }

    register(req, res) {
        res.render('register');
    }


    registerUser(req, res) {
        const { name, email, password, confirmPassword} = req.body;
        userService.register(name, email, password, confirmPassword)
            .then(() => res.redirect('/login'))
            .catch(err => res.status(500).send(err));
    }

    loginUser(req, res) {
        const { username, password } = req.body;
        userService.login(username, password)
            .then(user => {
                req.session.user = user;  
                res.redirect('/index');  
            })
            .catch(err => {
                console.log(err);
                res.status(500).send(err);
            });
    }


    addTextFile(req, res) {
        const userId = req.session.user.id;
        const { filename, filecontent } = req.body;
        const parentPath = path.join(__dirname, '../../../directory'); 

        userService.addTextFile(userId, filename, filecontent, parentPath)
            .then(result => {
                res.redirect('/index');  
            })
            .catch(err => {
                console.log('Error creating file: ' + err);
                res.status(500).send(err);
            });

    }

    

    upload(req, res){
        userService.uploadFile(req, res);
    }





}

module.exports = new SiteController();