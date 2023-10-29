const express = require("express");
const app = express();
const http = require("http").Server(app);

const nicolist = require("./nicolist.js");

const port = 8000;

app.use(express.urlencoded({extended: true}));

app.get("/",function(req,res)
{
  res.sendFile(__dirname + "/html/home.html");
});

app.post("/add",function(req,res)
{
  console.log("get add");
  nicolist.add(req.body.tag);
  res.redirect("/");
});

http.listen(port);

//  サーバにアクセスするためのURLを出力
console.log('Server running at http://127.0.0.1:8000/');
