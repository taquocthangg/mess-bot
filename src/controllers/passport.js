const FacebookStrategy = require('passport-facebook').Strategy;
const { default: axios } = require('axios');
const passport = require("passport");
const Socials = require('../model/sociials'); // Sửa chính tả nếu cần

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email'],
    passReqToCallback: true,
},
async function (req, accessToken, refreshToken, profile, cb) {
    const userId = req.session.userId; 
    console.log('accessToken', accessToken);
    console.log('userId:', userId);

    try {
        // Lấy thông tin trang (page access token)
        const pagesResponse = await axios.get('https://graph.facebook.com/me/accounts', {
            params: {
                access_token: accessToken,
            },
        });



        // Lấy avatar của từng page
        const pagesWithAvatars = await Promise.all(pagesResponse.data.data.map(async (page) => {
            const pageDetailsResponse = await axios.get(`https://graph.facebook.com/${page.id}`, {
                params: {
                    access_token: accessToken,
                    fields: 'id,name,picture,access_token'
                },
            });
            return pageDetailsResponse.data;
        }));

        console.log('Pages with avatars:',pagesWithAvatars);
        console.log('avatar', profile._json.picture.data);

        // Tạo đối tượng info từ pagesWithAvatars
        const infoData = pagesWithAvatars.map(page => ({
            pageID: page.id,
            pageName: page.name,
            pageAccessToken: page.access_token, // Hoặc bạn có thể lấy token cụ thể cho từng page
            userAccessToken: accessToken,
            botId: 'your_bot_id', // Thay thế bằng bot ID của bạn
            chatBoxID: 'your_chatbox_id', // Thay thế bằng chat box ID của bạn
        }));

        // Tìm kiếm và cập nhật hoặc tạo mới
        const updateData = {
            info: infoData,
            type: 'facebook',
            owner: userId,
            startDate: new Date(), // Ngày bắt đầu thực tế
            endDate: null, // Ngày kết thúc nếu có
        };

        const updatedSocial = await Socials.findOneAndUpdate(
            { owner: userId }, // Tìm theo owner
            updateData, // Dữ liệu mới để cập nhật
            { new: true, upsert: true } // `new: true` trả về bản ghi đã cập nhật, `upsert: true` tạo mới nếu không tìm thấy
        );

        console.log('Social information updated or created:', updatedSocial);

        cb(null, profile);
    } catch (error) {
        console.error('Lỗi khi lấy page access token:', error);
        cb(error, null);
    }
}));
