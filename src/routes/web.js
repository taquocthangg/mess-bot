import express from "express";
import homepageController from "../controllers/homepageController";
import passport from "passport";

let router = express.Router();

let initWebRoutes = (app)=> {
    router.get("/", homepageController.getHomePage);
    router.get("/webhook", homepageController.getWebhook);
    router.post("/webhook", homepageController.postWebhook);

    router.get("/facebook/callback", homepageController.getCallback);
    router.get('/auth/facebook', passport.authenticate('facebook', {session: false,
        scope: ['email', 'public_profile', 'pages_show_list', 'pages_read_engagement', 'pages_manage_metadata']
    }));
    router.get('/auth/facebook/callback', 
        passport.authenticate('facebook', { failureRedirect: '/login' }),
        (req, res) => {
            // Đăng nhập thành công, hiển thị thông tin người dùng và các trang
            res.json({
                message: 'Đăng nhập thành công!',
            });
        }
    );
    // router.post("/set-up-profile", homepageController.handleSetupProfile);
    // router.get("/set-up-profile", homepageController.getSetupProfilePage);

    // router.get("/info-order", homepageController.getInfoOrderPage);
    // router.post("/set-info-order", homepageController.setInfoOrder);
    return app.use("/", router);
};

module.exports = initWebRoutes;
