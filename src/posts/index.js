const cors = require('cors')
const express = require("express")
const axios = require('axios').default


const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.port || 5000

const posts = []

app.get('/', async (req, res) => {
    try {
        const commentServiceName = process.env.COMMENTS
        if (!commentServiceName) {
            return res.status(400).json({"error": "Comments service name environment variable - COMMENTS not defined."})
        }
        const postsWithComments =await Promise.all(posts
            .map(async (post) => {
                const comments = await (await axios.get(`http://${commentServiceName}:${port}/${post.id}`)).data
                return {
                    ...post,
                    comments
                }
            }))
        return res.status(200).json(postsWithComments)
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({"error": error})
    }
})

app.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params['id'])
        console.log(`Incoming request to find post with ID #${id}`)
        const post = posts.find(p => p.id === id)
        return res.status(post ? 200 : 404).json(post)
    }
    catch (error) {
        return res.status(500).json({"error": error.message})
    }
})

app.post('/', async (req, res) => {
    const payload = req.body
    const { title, description } = payload
    try {
        if (title == null || description == null) {
            throw new Error("Incorrect payload")
        }
        const post = {
            id: posts.length + 1,
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

/*
    * OVER ENGINEERED HERE, DELETE ENDPOINT NOT NECESSARY FOR THE GATEWAY TUTORIAL
*/
// app.delete('/:id', async (req, res) => {
//     try {
//         const id = parseInt(req.params['id'])
//         const post = posts.find(p => p.id === id)
//         if (!post) {
//             return res.status(404).json({"error": `Post with ID #${id} not found.`})
//         }
//         const commentServiceName = process.env.COMMENTS
//         if (!commentServiceName) {
//             return res.status(400).json({"error": "Comments service name environment variable - COMMENTS not defined."})
//         }
//         await axios.delete(`http://${commentServiceName}:${port}/${id}`)
//         posts
//             .splice(posts.indexOf(post), 1)
//         return res.status(200).json({
//             msg: `Post with ID #${id} successfully deleted`,
//             data: posts,
//         })
//     }
//     catch(error) {
//         return res.status(500).json({"error": error.message})
//     }
// })

app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`)
})