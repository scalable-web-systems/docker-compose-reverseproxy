const express = require('express')
const gateway = require('fast-gateway')
const port = 5000

try {
    const postServiceName = process.env.POSTS
    const commentServiceName = process.env.COMMENTS
    if (!postServiceName || !commentServiceName) {
        throw new Error("Environment variables for post service or comment service not set!")
    }
    const server = gateway({
        server: express(),
        routes: [{
            pathRegex: '',
            prefix: '/posts/:id',
            hooks: {
                onRequest(req, res) {
                    return res.status(403).json({"msg": "private endpoint!"})
                }
            }
        },{
            prefix: '/posts',
            target: `http://${postServiceName}:${port}`,
        }, {
            prefix: '/comments',
            target: `http://${commentServiceName}:${port}`,
            methods: ['POST']
        },]
    })

    server.listen(port)
}
catch(error) {
    console.error(error)
}