// db.js
const mongoose = require('mongoose');

// Chuỗi kết nối từ MongoDB Atlas, thay thế với thông tin của bạn
const uri = "mongodb+srv://tqthang2423:e0SvXwm4aKbXfqcG@mess-bot.peg0z.mongodb.net/?retryWrites=true&w=majority&appName=Mess-bot";

// Hàm kết nối tới MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Kết nối đến MongoDB Atlas thành công!');
    } catch (error) {
        console.error('Lỗi kết nối đến MongoDB Atlas:', error);
        process.exit(1); // Thoát ứng dụng nếu không thể kết nối
    }
};

module.exports = connectDB;
