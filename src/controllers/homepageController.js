// homepageController.js
require("dotenv").config();
const axios = require("axios");
const Token = require("../model/token");
const chatbotService = require("../services/chatbotService");

const MY_VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

let getHomePage = (req, res) => {
    return res.render("homepage.ejs", {
        facebookAppId: FACEBOOK_APP_ID
    });
};

// Webhook xác thực
let getWebhook = (req, res) => {
    let VERIFY_TOKEN = MY_VERIFY_TOKEN;
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
};

// Lắng nghe và xử lý sự kiện tin nhắn từ webhook
let postWebhook = (req, res) => {
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(function (entry) {
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            let sender_psid = webhook_event.sender.id;
            console.log("Sender PSID:", sender_psid);

            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
};

// Hàm xử lý tin nhắn
let handleMessage = async (sender_psid, received_message) => {
    let response;
console.log(sender_psid);
    if (received_message.text) {
        response = { "text": `Bạn đã gửi tin nhắn: "${received_message.text}"` };
    } else if (received_message.attachments) {
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Đây có phải hình bạn muốn không?",
                        "subtitle": "Nhấn vào để chọn.",
                        "image_url": attachment_url,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Có!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "Không!",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }
        };
    }

    await chatbotService.sendMessage(sender_psid, response);
};

// Hàm xử lý postback
let handlePostback = async (sender_psid, received_postback) => {
    let payload = received_postback.payload;
    let response;

    if (payload === 'yes') {
        response = { "text": "Cảm ơn bạn đã xác nhận!" };
    } else if (payload === 'no') {
        response = { "text": "Xin lỗi! Hãy gửi lại ảnh khác." };
    }

    await chatbotService.sendMessage(sender_psid, response);
};

// Callback lấy access token của người dùng và lưu vào MongoDB
let getCallback = async (req, res) => {
    const code = req.query.code;
    try {
        const tokenResponse = await axios.get(`https://graph.facebook.com/v17.0/oauth/access_token`, {
            params: {
                client_id: FACEBOOK_APP_ID,
                client_secret: FACEBOOK_APP_SECRET,
                redirect_uri: REDIRECT_URI,
                code: code,
            },
        });
        const userAccessToken = tokenResponse.data.access_token;

        // Lưu access_token vào MongoDB
        await Token.create({ token: userAccessToken });

        const pagesResponse = await axios.get(`https://graph.facebook.com/v17.0/me/accounts`, {
            params: { access_token: userAccessToken },
        });
        const pages = pagesResponse.data.data;

        res.json(pages);

    } catch (error) {
        console.error('Lỗi khi lấy access token:', error);
        res.status(500).send('Lỗi xác thực');
    }
};

module.exports = {
    getHomePage,
    getWebhook,
    postWebhook,
    getCallback
};
