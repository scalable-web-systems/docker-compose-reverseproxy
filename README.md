# Tutorial on Docker Compose 2 | Reverse Proxys

## Objective
This tutorial is the second tutorial in the docker-compose series and focuses on reverse proxys. It also underscores the importance of not exposing all endpoints to the outside world and stresses on the concept of abstraction. [Click here](https://github.com/scalable-web-systems/docker-compose-node) to navigate to the first tutorial in this series to learn more about docker-compose.

## Prerequisites
##### Side note: There are links attached to the bottom of this tutorial for our readers who may not be familiar with the technologies used here.
1. The reader should have completed the [first tutorial](https://github.com/scalable-web-systems/docker-compose-node) of this series. 
2. The reader should be familiar with axios, asynchrous operations, promises, etc.
3. The reader should have PostMan installed on their machine. Alternatively, one can use CLI tools such as Curl, WGet etc. to make the API calls.
4. The reader should clone this repository to their local machine before moving on to the next section.

## What is Reverse Proxy?
Wikipedia defines reverse proxy as _an application that sits in front of backend applications and forwards client requests to those applications_. So why should we use reverse proxys? Why can't we just publish our backend applications to the outside world?

### Abstraction
Abstraction is the concept of hiding unnecessary details and showing only relavant information. The real world systems based on microservice architecture consist of many backend APIs, each having various endpoints. With such systems, security becomes a crucial non-functional requirement. A client does not need to know about the number of APIs in the system or even necessarily have access to all of the available endpoints. In such cases, we use a reverse proxy - an application that forwards the client requests to the appropriate API endpoint. This way, the client only knows about one backend application, the reverse proxy. It only knows about the endpoints that we want it to be aware of. We can selectively enable or disable access to certain endpoints even within the same API. Isn't that cool?

## Let's Look at the Code

### Docker Compose
In the previous tutorial, we learned some basics of docker compose and how to write our own docker compose scripts to orchestrate multi container applications. Now it's time to expand that knowledge. Once you have cloned the repository, pull up VS Code or your favorite IDE and open the docker-compose.yml script. It should like this:

```
version: '3.3'
services:
  posts:
    build:
      context: ./src/posts
    expose:
      - 5000
    environment:
      - COMMENTS=comments
    networks:
      - network
  
  comments:
    build:
      context: ./src/comments
    expose:
      - 5000
    environment:
      - POSTS=posts
    networks:
      - network
  
  reverseproxy:
    build: 
      context: ./src/reverseproxy
    ports:
      - 5000:5000
    environment:
      - POSTS=posts
      - COMMENTS=comments
    depends_on:
      - posts
      - comments
    networks:
      - network

networks:
  network:
```

Okay so what's different? The first major difference is the introduction of a new service named **reverseproxy**. Let's look at this service in isolation.
```
  reverseproxy:
    build: 
      context: ./src/reverseproxy
    ports:
      - 5000:5000
    environment:
      - POSTS=posts
      - COMMENTS=comments
    depends_on:
      - posts
      - comments
    networks:
      - network
```
Just like the first two services, it relies on a Dockerfile to build the image. It publishes the port 5000 to the outside world and maps it to the interal port, also 5000, exposed by the service. But there's a new section within this **reverseproxy** service. Let's take a closer look at the `depends_on` section. So here we tell docker compose that the **reverseproxy** service relies on the posts and comments service. This makes sense. The reverse proxy won't work as expected if it cannot route the client requests to the 2 APIs that it sits in front of. So when you do `docker-compose up`, docker compose will first build the **posts** and **comments** service before building the **reverseproxy** service. Similarly, `docker-compose down` will stop **reverseproxy** before shutting down **posts** and **comments** services.

Okay next. Let's take a look at the `networks` section. Here's how it looks when zoomed in:

```
    networks:
      - network
```

Here we are simply saying that connect this service to the network named **network** that we have defined at the bottom of the script. Let's zoom out.

```
networks:
  network:
```

Note that this is an independent, top-level section with zero indentation. We define a new network named **network**. This is different from the `networks` section we discussed about above. One `networks` section is defined under a service and tells docker compose to connect that service to a given network. This other `networks` section is a top level section and defines the networks.

Okay so let's jump back to the **reverseproxy** service. We introduce another section under this service - `environment`. Quite intuitive. We define a few environment variables for the service. Here we're simply passing the names of the **posts** and **comments** service as environment variables. Similarly, we are passing in environment variables in **posts** and **comments** services as well.

One last difference between this script and the script we looked at in the previous tutorial is this line 
```
expose:
  - 5000
``` 
It's worth noting that we are still using `ports:` section for the **gateway** service but use the `expose:` section for the **posts** and **comments** service. By saying that we are exposing the port 5000, we're simply allowing other services on the same network to access the given service on port 5000. But we stop short of publishing the port to the outside world. This is important. Because we don't want the outside world to have access to our individual APIs. Any request from the client should come through the **reverseproxy** service which we do publish to the outside world.

### reverseproxy
So now that we have inspected the changes in the docker-compose.yml script, let's take a look at the source code for the **reverseproxy** API. Pull up the `index.js` file located in the `src/reverseproxy` subdirectory. This is how the code looks like:

```
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
```
We introduce a new dependency here - fast-gateway. It allows us to create a reverse proxy server and channel the incoming client requests to the correct API endpoint without exposing our individual API servers.
`const gateway = require('fast-gateway')`

Inside of the try block, we first do a sanity check to make sure that the environment variables for the service names of our two backend APIs have been set. If not, we throw an error and the server won't be fired up. Now we could have easily hardcoded the service names. But it's a bad practice. When producing high quality code, you should never want to hardcode things. What if down the line, we change the names of these services in our docker-compose.yml file? It'd be very inconvenient for us, as developers, to come back to this source code and manually update the hardcoded strings. These variables should be set such as their values can be adjusted at the configuration level.

Okay next. We create an instance of the reverse proxy server by invoking the **gateway** function and passing in the configuration options as an object. Let's take a closer look at that object.

```
{
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
    }
```
The first property we pass in is the **server** property. We want our reverse proxy to leverage the wonderful express framework that we are all used to working with to create minimal REST APIs.This property is optional. We have configured it for a reason. We'll get to that in a bit.

Next, we define our routes. The value of the **routes** property is an array of objects, each one defining an individual route. Before we go any further, let's list all the available endpoints:

#### Posts
* Payload:
```
{
id: number,
title: string,
description: string
comments: Comment[]
}
```
* Endpoints:
  * GET / - returns a list of all posts (public)
  * GET /:id - returns an individual post with the given id (private)
  * POST / - adds a new post with the given title and description (public)

#### Comments
* Payload:
```
{
id: number,
postId: number,
message: string
}
```
* Endpoints:
  * GET / - returns a list of all comments (private)
  * GET /:id - returns all comments of a post with the given id (private)
  * POST / - adds a new post with the given message and post id, if the post with the supplied id exists (public)


The endpoints denoted as private will not be accessible through the reverse proxy and hence won't be accessible to the outside world. They will only be accessible from other services (posts, comments) on the same network. At this time, we don't want the client to be able get an individual post or comments. 

The compiler interprets the options in a top-down manner. This is paramount to successfully configuring the routes. Here, we first define the `/posts/:id` route. Had we defined `/posts` route first, all the subsequent sub routes, including `/posts/:id` would have become public. We configure the **OnRequest** hook for this route since we want to intercept all incoming requests to this route and return a forbidden 403 error. Remember we optionally configured our reverse proxy to use express as the server? Well, we did that in order us to be able to take advantage of the multitude of options unlocked with express's res variable as opposed to using the standard res variable.

Next we define the `/posts` route and we set the target to our posts service. Note that we communicate with all the services on the same docker-compose network using their names. We are not intercepting any request here nor are we supplying any additional configuration options because all of our other **Post** service endpoints are public.

Next we define the `/comments` route. It looks very similar with a minor difference. We configure the **methods** property to allow access to only GET endpoints.

## Steps
1. Fire up the system using `docker-compose up` or `docker-compose up -d` to run the system in detached mode.
2. Tab over to PostMan and try accessing the GET `/posts/` endpoint. You should get the following output:
![image](https://user-images.githubusercontent.com/7733516/151725182-196c1c10-a0a9-415e-9c76-8a4b33a1fb35.png)
3. Now, try adding a new post by selecting POST from the dropdown and defining the correct payload. You should get the following output:
![image](https://user-images.githubusercontent.com/7733516/151725336-bf893511-9afb-4efe-909f-5c439286866c.png)
4. Now try grabbing the list of posts once more:
![image](https://user-images.githubusercontent.com/7733516/151725411-2f6fd61a-d7e3-40e0-b5a3-6f75c17789ac.png)
You'll see your newly added post with an empty comments list. That's because no comments for this post have been added yet. Let's add a new comment now.
5. Set the method to POST and type `http://localhost:5000/comments/` in the url bar in POSTMAN. Define the payload for the comment in the body and pass in an invalid ID on purpose:
![image](https://user-images.githubusercontent.com/7733516/151725570-0187a2ae-0cb6-48c0-bee0-6fb47f2d8694.png)
Our **reverserproxy** service returns 500 status code because it in turn receives 404 from our comments service. Since we don't have any post with the id 3, our comment service throws 404. It interally communicates with our **posts** service through the private endpoint `/posts/:id` and pieces it together that no such post exists. Let's look at the logs. Tab over to your terminal window and type `docker-compose logs posts`:
![image](https://user-images.githubusercontent.com/7733516/151725941-a8d78ab0-3150-4fcb-8d8b-7b473cd87102.png)

6. Now let's add a new comment for the post which we just created:
![image](https://user-images.githubusercontent.com/7733516/151725769-2e8f65a5-5c25-479d-af18-bde9f9b04854.png)
You should get a 200 status code back and should be able to view your newly added comment in the output.
7. Let's try to get all the posts again:
![image](https://user-images.githubusercontent.com/7733516/151725815-c55457f6-7f7f-406b-a381-dcff7aff381f.png)
You should be able to see your post along with its newly added comment. But wait. How did our **posts** service know that there's a new comment on this post? Let's look at the logs for our **comments** service. Tab over to your terminal window and type `docker-compose logs comments`:
![image](https://user-images.githubusercontent.com/7733516/151725978-390b0fc3-3511-4e4a-8396-b5243b9100c8.png)
Below the verbose 404 stack trace from when we accessed the `/posts/` endpoint when there were no comments for the post, you will see the log message saying that there's been an incoming request to this private endpoint.

## Conclusion
After doing this tutorial, one should have a strong understanding of reverse proxies and its applications. One should be able to use the npm fast-gateway package to create their own reverse proxy and selectively allow access to different API endpoints.

### Links
1. [Javascript Tutorial](https://www.w3schools.com/js/)
2. [Npm](https://www.npmjs.com/)
3. [NodeJS](https://nodejs.org/en/docs/)
4. [Express](https://expressjs.com/en/starter/hello-world.html)
5. [Docker](https://docs.docker.com/get-started/)
6. [Fast Gateway NPM Package](https://www.npmjs.com/package/fast-gateway)
7. [Promises, Async, Await - JS](https://javascript.info/async)
8. [Axios](https://github.com/axios/axios)


