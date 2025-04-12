const express = require('express')
const users = require('./mock_data.json')
const fs = require('fs')

const app = express();
const port = 3000;

//middleware as plugins 
app.use(express.urlencoded({extended: false})); // ye middleware form data ko object m convert karta h or use req.body m dalta h

//middleware implementation
app.use((req,res,next) =>{
    console.log(`Hello from midddleware 1`);
    req.newUserName = "Manisha";
    next();
})

app.use((req,res,next) =>{
    console.log(`Hello from midddleware 2 ${req.newUserName}`);
    return res.end("Hey")
})
//Routes
app.get('/api/users',(req,res) =>{
    return res.json(users)
})

app.post("/api/users",(req,res)=>{
    const body = req.body;
    // console.log(body);
    users.push({...body, id: users.length + 1});
    fs.writeFile('./mock_data.json',JSON.stringify(users),(err,data) =>{
        return res.json({status: "Success", id: users.length})

    })
})
app.get('/users',(req,res)=>{
    const html = `
    <ul>
        ${users.map((user)=>`<li>${user.first_name}</li>`).join("")}
    </ul>
    `;
    res.send(html);
})
app.route("/api/users/:id")
.get((req,res) =>{
    const id = req.params.id;
    const user = users.find((user) => user.id == id);
    res.send(user)}
)
.patch(
    (req,res)=>{
        //edit user with id 
        const id  = req.params.id;
        const user = users.find((user) => user.id == id);
        const newData = req.body;
        let itemFound = false;
        
        return res.json({status: "Pending"})
    }
)
.delete(
    (req,res)=>{
        //delete user with id 
        return res.json({status: "Pending"})

    }
)
// app.get("/api/users/:id",(req,res) =>{
//     const id = req.params.id;
//     const user = users.find((user) => user.id == id);
//     res.send(user)
// })

// app.post("/api/users",(req,res)=>{
//     //TODO: create new user
//     return res.send({Status: "Pending"})
// })


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    
})