const http = require('http')
const fs = require('fs')
const url = require('url')

const myServer = http.createServer((req,res) => {
    if(req.url === "/favicon.ico") return res.end();
    const log = `${Date.now()}: ${req.url}: New Req Received!\n`;
    const myUrl = url.parse(req.url,true);
    console.log(myUrl.pathname)
    fs.appendFile("log.txt", log,(err,data) => {

        switch (req.url){
            case "/":
                res.end("HomePage");
                break;
            case "/about":
                const username = myUrl.query.myname

                res.end(`HII ${username}`)
                break;
            default: 
                res.end("Hello from Server Again")

        }
    })
    // console.log(req.headers);
    // res.end("Hello from server");
    
});

myServer.listen(3000,()=>{
    console.log("Server started at port 3000");
    
})