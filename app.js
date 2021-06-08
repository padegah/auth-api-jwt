const express = require("express");
const jwt = require("jsonwebtoken");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
require('dotenv').config();
const nodemailer = require('nodemailer');

const app = express();

const transporter = nodemailer.createTransport( {
    service: "hotmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
});

const options = {
    from: process.env.EMAIL,
    to: "kofipaa@gmail.com",
    subject: "testing email from authAPI",
    text: "testing email from authAPI!!"
};


transporter.sendMail(options, function(err, info) {
    if(err) {
        console.log(err);
        return;
    }

    console.log(info.response);
});

let validTokens = [];

const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Authentication API",
            version: "1.0.0",
            description: "Authentication API using JWT",
            contact: {
                name: "padegah",
                email: "prince.adegah@amalitech.org"
            },
            servers: ["http://localhost:3000"]
        },
        components: {
            securitySchemes: {
                jwt: {
                    type: "http",
                    scheme: "bearer",
                    in: "header",
                    bearerFormat: "JWT",
                    description: "Enter apiToken"
                },
            }
        },
        security: [{
            jwt: []
        }],
    },
    apis: ["app.js"]
};


const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use("/api/api-doc", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

/**
 * @swagger
 * /api:
 *  get:
 *      description: Use to access the default url
 *      responses:
 *          '200':
 *              description: A succesfull response
 *          '400':
 *              description: Failure
 */

app.get("/api", function(req, res) {
    // res.json({
    //     message: "Welcome to the API"
    // });

    res.send(`
        <h1>Welcome to Authentication API using JWT</h1>
        <a href="http://localhost:3000/api/api-doc">Check Documentation here</a>
    `);
});


/**
 * @swagger
 * 
 * /api/posts:
 *  post:
 *      security:
 *          - jwt: []
 *      description: Create a new post
 *      responses:
 *          '200':
 *              description: Success
 *          '400':
 *              description: Failure
 */

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
                message: "Invalid or expired token"
            });
        }
    });
});


/**
 * @swagger
 * /api/login:
 *  post:
 *      description: Login
 *      responses:
 *          '200':
 *              description: A succesfull login
 *          '400':
 *              description: Login failure
 */

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



/**
 * @swagger
 * 
 * /api/logout:
 *  post:
 *      security:
 *          - jwt: []
 *      description: Logout
 *      responses:
 *          '200':
 *              description: Success
 *          '400':
 *              description: Failure
 */

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
            message: "Forbidden, provide token in the header"
        });
    }

}


app.listen(3000, () => console.log("Server started on port 3000"));