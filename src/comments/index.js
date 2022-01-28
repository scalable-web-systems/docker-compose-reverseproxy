const cors = require('cors')
const express = require("express")

const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.port || 5000

const comments = []

app.get('/', (req, res) => {
    return res.status(200).json(comments)
})

app.post('/', (req, res) => {
    const payload = req.body
    const { postId, message } = payload
    try {
        if (postId == null || message == null) {
            throw new Error("Incorrect payload")
        }
        const comment = new {
            id: comments.length + 1,
            postId,
            message
        }
        comments.push(comment)
        return res.status(201).json(comments)
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({error: error.message})
    }
})

app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`)
})