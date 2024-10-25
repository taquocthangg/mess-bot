const axios = require("axios");
const tokenService = require("../../token");

let sendMessage = async (sender_psid, response) => {
    const PAGE_ACCESS_TOKEN = tokenService.getToken(); 

    try {
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
