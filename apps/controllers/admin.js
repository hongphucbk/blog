var express = require("express");
var router = express.Router();

var user_md = require("../models/user");
var post_md = require("../models/post");


var helper = require("../helpers/helper");

router.get("/",function(req, res){
    if(req.session.user){
    //res.json({"message": "This is admin page"});
    var data = post_md.getAllPosts();
    data.then(function(posts){
        var data = {
            posts:posts,
            error:false
        };

        res.render("admin/dashboard",{data:data});
    }).catch(function(err){
        res.render("admin/dashboard",{data:{error:"Get post data error"}});
    });
    }else{
        res.redirect("admin/signin");
    }
});

router.get("/signup",function(req, res){
    res.render("signup",{data:{}});
});

router.post("/signup",function(req,res){
    var user = req.body;

    if(user.email.trim().length == 0){
        res.render("signup",{data: {error: "Email is required"}});
    }

    if(user.password != user.repassword && user.password.trim().length != 0){
        res.render("signup",{data:{error: "Pass khong dung"}});
    }

    var password = helper.hash_password(user.password);
    //Insert to DB
    user = {
        email:user.email,
        password: password,
        first_name: user.first_name,
        last_name: user.last_name
    };

    var result = user_md.addUser(user);

    result.then(function(data){
        //res.json({message:"Insert success"});
        res.redirect("/admin/signin");
    }).catch(function(err){
        res.render("signup",{data:{error:"Khong the chen vao"}});
    });
    // if (!result) {
    //     res.render("signup",{data:{error:"Khong the chen vao database"}});
    // } else {
    //     res.json({message:"Thanh cong"});
    // }
})

router.get("/signin",function(req, res){
    res.render("signin",{data:{}});
});

router.post("/signin",function(req, res){
    var params = req.body;

    if (params.email.trim().length == 0) {
        res.render("signin",{data:{error: "Loi chua nhap email"}});
    } else {
        var data = user_md.getUserByEmail(params.email);
        
        if (data) {
            data.then(function(users){
                var user = users[0];

                var status = helper.compare_password(params.password, user.password);
                var test1 = helper.hash_password(params.password);
                if (!status) {
                    res.render("signin",{data:{error: "Sai mat khau " + user.password + " params.password " + params.password + " status " + status + "Pass ma hoa: "+ test1}});
                } else {
                    req.session.user = user;
                    console.log(req.session.user);
                    res.redirect("/admin/");
                }
            });
        } else {
            res.render("signin",{data:{error:"Khong ton tai user"}});
        }
    }
})

router.get("/post/new", function(req, res){
    if (req.session.user) {
        res.render("admin/post/new", {data: {error: false}})
    } else {
        res.redirect("admin/signin");
    }
    
});

router.post("/post/new", function(req, res){
    var params = req.body;

    if (params.title.trim().length ==0) {
        var data = {
            error:"please enter title"
        }       
        res.render("admin/post/new", {data:data})
    } else {
        var now = new Date();
        params.created_at = now;
        params.updated_at = now;
        var data = post_md.addPost(params);
        data.then(function(result){
            res.render("admin/post/new")
        }).catch(function(err){
            var data = {
                err : "could not insert post"
            };
            res.render("admin/post/new", {data:data})
        });
    }
});

router.get("/post/edit/:id", function(req, res){
    var params = req.params;
    var id = params.id;
    
    var data = post_md.getPostById(id);
    if (data) {
        data.then(function(posts){
            var post = posts[0];
            var data = {
                post: post,
                error:false
            }
            res.render("admin/post/edit", {data: data})
        }).catch(function(err){
            var data = {
                err : "could not get Post by id"
            };
            res.render("admin/post/edit", {data:data});
        });
    } else {
        var data = {
            err : "could not get Post by id"
        };
        res.render("admin/post/edit", {data:data});
    }
    
});

router.put("/post/edit",function(req, res){
    var params = req.body;

    data = post_md.updatePost(params);
    if (data) {
        data.then(function(result){
            res.json({status_code: 200});
        }).catch(function(err){
            res.json({status_code: 500});
        });
    } else {
        res.json({status_code: 500});
    }
});

router.delete("/post/delete",function(req, res){
    var post_id = req.body.id;

    data = post_md.deletePost(post_id);
    if (data) {
        data.then(function(result){
            res.json({status_code: 200});
        }).catch(function(err){
            res.json({status_code: 500});
        });
    } else {
        res.json({status_code: 500});
    }
});

router.get("/post", function(req, res){
    if (req.session.user) {
        res.redirect("/admin");
    } else {
        res.redirect("admin/signin");
    }
    
});

router.get("/user", function(req, res){

    if (req.session.user) {
        var data = user_md.getAllUsers();

        data.then(function(users){
            var data = {
                users: users,
                error:false
            }
            res.render("admin/user", {data:data})
        }).catch(function(err){
            var data = {
                error:"Could not get user in database"
            }
            res.render("admin/user", {data:data})
        });
    } else {
        res.redirect("admin/signin");
    }
    
});

module.exports = router;