const cors = require('cors')
const express = require("express")
const axios = require("axios").default

const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.port || 5000

const comments = []

app.get('/', async (req, res) => {
    return res.status(200).json(comments)
})

app.post('/', async (req, res) => {
    const payload = req.body
    const { postId, message } = payload
    try {
        if (postId == null || message == null) {
            throw new Error("Incorrect payload")
        }
        const postServiceName = process.env.POSTS
        if (!postServiceName) {
            return res.status(400).json({"msg": "Environment variable for posts service name not set!"})
        }
        const fetchPostRequest = await axios.get(`http://${postServiceName}:${port}/${postId}`)
        const post = await fetchPostRequest.data
        if (!post) {
            return res.status(400).json({"msg": `Post with ID #${postId} not found!`})
        }
        const comment = {
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

app.get('/:id', async (req, res) => {
    try {
        const postId = parseInt(req.params['id'])
        console.log(`Incoming request to return comments associated with post ID #${postId}`)
        return res.status(200).json(comments.filter(c => c.postId === postId))
    }
    catch(error) {
        console.error(error)
        return res.status(500).error({"error": error})
    }
})

/*
    * OVER ENGINEERED HERE, DELETE ENDPOINT NOT NECESSARY FOR THE GATEWAY TUTORIAL
*/
// app.delete('/:postId', (req, res) => {
//     try {
//         const postId = parseInt(req.params['postId'])
//         console.log(`Incoming request to delete comments associated with post ID # ${postId}`)
//         const filteredComments = comments
//             .filter(c => c.postId === postId)
//         filteredComments
//             .forEach(
//                 fc => comments.splice(
//                     comments.indexOf(comments.find(c => c.id === fc.id)),
//                     1,
//                 )
//             )
//         return res.status(200).json({
//             "msg": `All comments associated with the post #${postId} have been deleted`, 
//             "data": comments
//         })
//     }
//     catch(error) {
//         console.error(error)
//         return res.status(500).json({error: error.message})
//     }
// })

app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`)
})