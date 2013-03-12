

exports.get = function(req, res){
    res.json({
        headers:req.headers,
        params:req.query
    });
};
