const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

let validTokens = [];

app.get("/api", function(req, res) {
    res.json({
        message: "Welcome to the API"
    });
});

app.post("/api/posts", verifyToken, function(req, res){

    jwt.verify(req.token, "secretkey", function(err, authData){
        if(validTokens.includes(req.token)) {
            if(err) {
                res.json({
                    message: "Forbidden"
                });
            } else {
                res.json({
                    message: "Post created successfully ...",
                    authData: authData
                });
            }
        } else {
            res.json({
                message: "Token expired"
            });
        }
    });
});

app.post("/api/login", function(req, res){
    const user = {
        id: 1,
        name: "prince",
        email: "prince@gmail.com"
    };

    jwt.sign({user: user}, "secretkey", function(err, token){
        validTokens.push(token);
        res.json({
            token: token
        });
        console.log(validTokens);
    });
});


app.post("/api/logout", verifyToken, function(req, res){

    const tokenToInvalidate = req.token;

    let index = validTokens.indexOf(tokenToInvalidate);

    console.log(index);

    validTokens.splice(index, 1);

    console.log(validTokens);

    res.json({
        message: "Logout succesfull"
    });
});


function verifyToken (req, res, next) {
    const bearerHeader = req.headers["authorization"];

    if(typeof bearerHeader !== "undefined") {
        const bearerToken = bearerHeader.split(" ")[1];

        req.token = bearerToken;
        next();

    } else {
        res.json({
            message: "Forbidden"
        });
    }
    
    next();
}


app.listen(3000, () => console.log("Server started on port 3000"));