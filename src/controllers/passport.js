// passport-setup.js
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const axios = require('axios');

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.REDIRECT_URI,
    profileFields: ['id', 'displayName', 'photos', 'email'],
}, async (accessToken, refreshToken, profile, done) => {
    console.log('Đăng nhập thành công:', profile);

    // Lưu access token của người dùng vào profile
    profile.accessToken = accessToken;

    try {
        // Lấy thông tin trang (page access token)
        const pagesResponse = await axios.get('https://graph.facebook.com/me/accounts', {
            params: {
                access_token: accessToken,
            },
        });

        const pages = pagesResponse.data.data;

        // Lưu thông tin page access token vào profile
        profile.pages = pages.map(page => ({
            pageID: page.id,
            pageName: page.name,
            pageAccessToken: page.access_token,
        }));
        console.log('profile',profile);
        done(null, profile); // Trả về profile người dùng cùng với thông tin page
    } catch (error) {
        console.error('Lỗi khi lấy page access token:', error);
        done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user); // Lưu thông tin người dùng vào session
});

passport.deserializeUser((user, done) => {
    done(null, user); // Khôi phục thông tin người dùng từ session
});
