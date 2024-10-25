require("dotenv").config();
const axios = require("axios");
const chatbotService = require("../services/chatbotService");
const Token = require("../model/token"); // Mô hình token để lưu trữ page token

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

    const pageAccessToken = await getPageAccessToken(); // Lấy page_access_token
    await chatbotService.sendMessage(sender_psid, response, pageAccessToken);
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

    const pageAccessToken = await getPageAccessToken(); // Lấy page_access_token
    await chatbotService.sendMessage(sender_psid, response, pageAccessToken);
};

// Callback lấy access token của người dùng
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
        console.log('userAccessToken', userAccessToken);
        // Lấy page access token
        const pageAccessToken = await getPageAccessToken(userAccessToken);
        console.log('pageAccessToken', pageAccessToken);
        await Token.create({ token: pageAccessToken }); // Lưu vào MongoDB

        res.json({ pageAccessToken });

    } catch (error) {
        console.error('Lỗi khi lấy access token:', error);
        res.status(500).send('Lỗi xác thực');
    }
};

// Hàm lấy page access token từ user access token
const getPageAccessToken = async (userAccessToken) => {
    if (!userAccessToken) {
        const tokenDoc = await Token.findOne();
        if (!tokenDoc || !tokenDoc.token) {
            throw new Error("Không tìm thấy page access token trong cơ sở dữ liệu.");
        }
        return tokenDoc.token;
    }

    try {
        const response = await axios.get('https://graph.facebook.com/me/accounts', {
            params: {
                access_token: userAccessToken,
            },
        });
        console.log(response.data);
        const pages = response.data.data;

        if (pages && pages.length > 0) {
            return pages[0].access_token; // Lấy page access token đầu tiên
        } else {
            throw new Error("Không tìm thấy trang nào liên kết với tài khoản của bạn.");
        }
    } catch (error) {
        console.error('Lỗi khi lấy page access token:', error.response ? error.response.data : error.message);
        throw error;
    }
};


module.exports = {
    getHomePage,
    getWebhook,
    postWebhook,
    getCallback
};
