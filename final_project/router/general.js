const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    if (!req.body.username)
        return res.send("Username is mandatory!")
    if (!req.body.password)
        return res.send("Password is mandatory!")

    let existingUser = users.filter(user => user.username === req.body.username);
    if (existingUser && existingUser.username)
        return res.send("ERROR! The user" + (' ') + (req.body.username) + " already exist!")

    users.push({ "username": req.body.username, "password": req.body.password });
    res.send("The user" + (' ') + (req.body.username) + " Has been added!")
});

// Get the book list available in the shop
const getAllBooks = new Promise((resolve, reject) => {
    try {
        const data = books;
        resolve(data)
    } catch (err) {
        reject(err)
    }
})
public_users.get('/', function (req, res) {
    getAllBooks.then(
        (data) => res.status(200).json(data)).catch((err) => res.send("Error loading the books:" + err))
});

// Get book details based on ISBN
const getDetails = async (url) => {
    const req = await axios.get(url)
    req.then(resp => {
        return resp.data;
    })
        .catch(err => {
            return null;
        })
}
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn
    getDetails('http://invalid-url/isbn/' + isbn)
        .then(resp => {
            res.status(200).json(books[isbn]);
        })
        .catch(err => {
            return res.status(300).json({ message: "Error retrieving book details" });
        })
});

// Get book details based on author
const getBooksByAuthor = (author) => {
    return new Promise( (resolve, reject) => {
        try{
            let books_filtered = Object.values(books).filter(book => book.author.toLowerCase().includes(author));
            resolve(books_filtered)
        }catch(err){
            reject(err)
        }
    })
}
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author ? req.params.author.toLowerCase() : '';
    //let filtered_books = Object.values(books).filter(book => book.author.toLowerCase().includes(author));
    //return res.status(200).json(filtered_books);
    getBooksByAuthor(author)
    .then(
        (data) => res.send(JSON.stringify(data,null,4)),
        (err) => res.status(300).json({message: "Error retrieving book details"})
    )
});

// Get all books based on title
const getBooksByTitle = (title) => {
    return new Promise( (resolve, reject) => {
        try{
            let books_filtered = Object.values(books).filter(book => book.title.toLowerCase().includes(title));
            resolve(books_filtered)
        }catch(err){
            reject(err)
        }
    })
}
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title ? req.params.title.toLowerCase() : '';
    //let filtered_books = Object.values(books).filter(book => book.title.toLowerCase().includes(title));
    //return res.status(200).json(filtered_books);
    getBooksByTitle(title)
    .then(
        (data) => res.send(JSON.stringify(data,null,4)),
        (err) => res.status(300).json({message: "Error retrieving book details"})
    )
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    return res.status(200).json(books[req.params.isbn].reviews);
});

module.exports.general = public_users;
