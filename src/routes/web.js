import express from "express";
import homepageController from "../controllers/homepageController";
import passport from "passport";

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", homepageController.getHomePage);
    router.get("/webhook", homepageController.getWebhook);
    // router.post("/webhook", homepageController.postWebhook);

    // router.get("/facebook/callback", homepageController.getCallback);

    // router.get('/auth/facebook', passport.authenticate('facebook', {session: false,
    //     scope: ['email', 'public_profile', 'pages_show_list', 'pages_read_engagement', 'pages_manage_metadata']
    // }));
    router.post('/webhook', (req, res) => {
        const body = req.body;

        // Kiểm tra xem yêu cầu có chứa tin nhắn hay không
        if (body.object === 'page') {
            body.entry.forEach(entry => {
                const messagingEvents = entry.messaging;

                messagingEvents.forEach(event => {
                    // Xử lý sự kiện tin nhắn
                    const senderId = event.sender.id; // ID của người gửi
                    const pageId = entry.id; // ID của page gửi tin nhắn
                    const message = event.message.text; // Tin nhắn nhận được

                    console.log(`Received message from page ${pageId} from ${senderId}: ${message}`);

                    // Tại đây bạn có thể gọi hàm xử lý tin nhắn, lưu trữ tin nhắn vào DB, hoặc trả lời tin nhắn
                    handleMessageFromPage(pageId, senderId, message);
                });
            });
            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    });
    async function handleMessageFromPage(pageId, senderId, message) {
        try {
            // Xử lý tin nhắn từ từng page
            console.log(`Processing message from page ${pageId}: ${message}`);

            // Có thể lưu trữ thông tin hoặc gửi phản hồi
            // Ví dụ: gửi phản hồi đến người gửi
            await sendMessageToUser(senderId, message); // Giả sử bạn có hàm này
        } catch (error) {
            console.error('Error processing message:', error);
        }
    }
    router.get('/auth/facebook', (req, res, next) => {
        const { userId } = req.query;
        console.log(userId);
        req.session.userId = userId;

        passport.authenticate('facebook', {
            session: false,
            scope: ['email', 'public_profile', 'pages_show_list', 'pages_read_engagement', 'pages_manage_metadata']
        })(req, res, next);
    });
    router.get('/facebook/callback', (req, res, next) => {
        passport.authenticate('facebook', (err, profile) => {
            req.user = profile
            next()
        })(req, res, next)
    }, (req, res) => {
        // res.redirect(`${process.env.URL_CLIENT}/login-success/${req.user?.id}/${req.user.tokenLogin}`)
        console.log(req);
    })
    // router.get('/facebook/callback', 
    //     passport.authenticate('facebook', { failureRedirect: '/login' }),
    //     (req, res) => {
    //         // Đăng nhập thành công, hiển thị thông tin người dùng và các trang
    //         res.json({
    //             message: 'Đăng nhập thành công!',
    //         });
    //     }
    // );


    // router.post("/set-up-profile", homepageController.handleSetupProfile);
    // router.get("/set-up-profile", homepageController.getSetupProfilePage);

    // router.get("/info-order", homepageController.getInfoOrderPage);
    // router.post("/set-info-order", homepageController.setInfoOrder);
    return app.use("/", router);
};

module.exports = initWebRoutes;
