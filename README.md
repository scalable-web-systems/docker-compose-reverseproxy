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



## Conclusion
After doing this tutorial, one should have a strong understanding of reverse proxies and its applications. One should be able to use the npm fast-gateway package to create their own gateway and selectively allow access to different API endpoints.

### Links
1. [Javascript Tutorial](https://www.w3schools.com/js/)
2. [Npm](https://www.npmjs.com/)
3. [NodeJS](https://nodejs.org/en/docs/)
4. [Express](https://expressjs.com/en/starter/hello-world.html)
5. [Docker](https://docs.docker.com/get-started/)


