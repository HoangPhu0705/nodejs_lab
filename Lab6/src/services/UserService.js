const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const multer = require('multer');
const connection = db.connect();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'directory/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage });
const UserService = {
    register: async (name, email, password, confirmPassword) => {
        return new Promise((resolve, reject) => {
            if (password !== confirmPassword) {
                reject(new Error('Passwords do not match.'));
            } else {
                bcrypt.hash(password, 10, function(err, hash) {
                    if (err) reject(err);

                    let sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
                    connection.query(sql, [name, email, hash], function(err, result) {
                        if (err) reject(err) 
                        resolve(result)
                    });
                });
            }
        });
    },

    login: (username, password) => {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM users WHERE username = ?`;
            connection.query(sql, [username], function(err, results) {
                if (err) reject(err);
                
                if (results.length > 0) {
                    const user = results[0];
                    
                    bcrypt.compare(password, user.password, function(err, result) {
                        if (err) reject(err);
                        
                        if (result) {
                            resolve(user);  
                        } else {
                            reject(new Error('Invalid password.'));  // Passwords don't match
                        }
                    });
                } else {
                    reject(new Error('No user found with this email.'));  // No user found
                }
            });
        });
    },

    
    addFile: (userId, name, type, parentPath) => {
        return new Promise((resolve, reject) => {
            const filePath = path.join(parentPath, name);

            if (type === 'folder') {
                fs.mkdir(filePath, { recursive: true }, (err) => {
                    if (err) reject(err);

                    let sql = `INSERT INTO files (user_id, name, path, type) VALUES (?, ?, ?, ?)`;
                    connection.query(sql, [userId, name, filePath, type], function(err, result) {
                        if (err) reject(err);
                        resolve(result);
                    });
                });
            } else {
                fs.writeFile(filePath, '', (err) => {
                    if (err) reject(err);

                    let sql = `INSERT INTO files (user_id, name, path, type) VALUES (?, ?, ?, ?)`;
                    connection.query(sql, [userId, name, filePath, type], function(err, result) {
                        if (err) reject(err);
                        resolve(result);
                    });
                });
            }
        });
    },


    addTextFile: (userId, name, content, parentPath) => {
        return new Promise((resolve, reject) => {
            const filePath = path.join(parentPath, name);

            fs.writeFile(filePath, content, (err) => {
                if (err) reject(err);

                const stats = fs.statSync(filePath);
                const size = stats.size  / (1024*1024);

                let sql = `INSERT INTO files (user_id, name, path, type, size) VALUES (?, ?, ?, 'file', ?)`;
                connection.query(sql, [userId, name, filePath, size], function(err, result) {
                    if (err) reject(err);
                    resolve(result);
                });
            });
        });
    },


    getUserFiles: (userId) => {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM files WHERE user_id = ?`;
            connection.query(sql, [userId], function(err, results) {
                if (err) {
                    reject(err);
                } else {
                    let directories = [];
                    let filesList = [];

                    results.forEach(function (file) {
                        const item = {
                            name: file.name,
                            type: file.type,
                            size: file.size + " MB",
                            lastModified: file.updated_at
                        };

                        if (file.type === 'folder') {
                            directories.push(item);
                        } else {
                            filesList.push(item);
                        }
                    });

                    resolve({ directories: directories, files: filesList });
                }
            });
        });
    },

    uploadFile: (req, res) => {
        upload.single('file')(req, res, function (err) {
            if (err) {
                console.log(err);
                return res.status(422).send("an Error occured")
            } 
            return res.send("Upload Completed for "+req.file.filename); 
        });
    },



    addFolder: (userId, name, parentPath) => {
        return new Promise((resolve, reject) => {
            const folderPath = path.join(parentPath, name);
    
            fs.mkdir(folderPath, { recursive: true }, (err) => {
                if (err) reject(err);
    
                let sql = `INSERT INTO files (user_id, name, path, type) VALUES (?, ?, ?, 'folder')`;
                connection.query(sql, [userId, name, folderPath], function(err, result) {
                    if (err) reject(err);
                    resolve(result);
                });
            });
        });
    }

};



module.exports = UserService;
