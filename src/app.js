const express = require("express")
require("./db/mongoose")
const userRouter = require("./routers/user")
const postRouter = require("./routers/post")

const port = process.env.PORT || 3000

const app = express()
app.use(express.json())
app.use(userRouter)
app.use(postRouter)

app.listen(port, () => {
    console.log("server is up on port " + port)
})