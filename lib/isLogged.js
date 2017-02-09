var settings = require('./settings');

module.exports = function (req, res, next) {
    var sess = req.session;
    if (sess && sess.user) {
        settings.get(sess.user)
            .then(user => {
                req.user = user;
                next();
            })
            .catch(err => res.status(500).json({message: err.message, stack: err.stack}));
        return;
    }
    res.redirect('/login');
};
