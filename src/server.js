require("dotenv").config();
import express from "express";
import configViewEngine from "./config/viewEngine";
import initWebRoutes from "./routes/web";
import bodyParser from "body-parser";
import connectDB from "../db";
import passport from "passport";
import session from "express-session";
require('./controllers/passport'); 

let app = express();
app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});
app.use(session({
    secret: '1234abvcd', // Thay thế YOUR_SESSION_SECRET bằng một chuỗi bí mật
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true } // Set secure: true nếu bạn đang sử dụng HTTPS
}));
//config body-parser to post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
//config view engine
configViewEngine(app);
connectDB();
//init web routes
initWebRoutes(app);

let port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Messenger is running at the port ${port}`);
});
