

exports.get = function(req, res){
    console.log('pidiendo user', req.user);
    res.json({aplo: req.user});
};
