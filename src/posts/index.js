const cors = require('cors')
const express = require("express")

const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.port || 5000

const posts = []

app.get('/', (req, res) => {
    return res.status(200).json(posts)
})

app.post('/', (req, res) => {
    const payload = req.body
    const { title, description } = payload
    try {
        if (title == null || description == null) {
            throw new Error("Incorrect payload")
        }
        const post = {
            id: posts.length,
            title,
            description
        }
        posts.push(post)
        return res.status(201).json(posts)
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({error: error.message})
    }
})

app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`)
})