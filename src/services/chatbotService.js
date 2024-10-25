// chatbotService.js
const axios = require("axios");
const Token = require("../model/token");

let sendMessage = async (sender_psid, response) => {
    try {
        // Lấy token từ MongoDB
        const tokenData = await Token.findOne().sort({ createdAt: -1 });
        const PAGE_ACCESS_TOKEN = tokenData.token;

        await axios({
            method: "POST",
            url: `https://graph.facebook.com/v17.0/me/messages`,
            params: { access_token: PAGE_ACCESS_TOKEN },
            data: {
                recipient: { id: sender_psid },
                message: response,
            },
        });
        console.log("Tin nhắn đã được gửi:", response);
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error.response ? error.response.data : error.message);
    }
};

module.exports = {
    sendMessage,
};
