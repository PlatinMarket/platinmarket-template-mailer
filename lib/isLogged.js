module.exports = function (req, res, next) {
    var sess = req.session;
    if (sess && sess.user) return next();
    res.redirect('/login');
};
