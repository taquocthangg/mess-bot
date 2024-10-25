let PAGE_ACCESS_TOKEN = "";

module.exports = {
    getToken: () => PAGE_ACCESS_TOKEN,
    setToken: (token) => {
        PAGE_ACCESS_TOKEN = token;
    }
};
