# Tutorial on Docker Compose | Node

## Objective
This tutorial focuses on docker-compose and how to use this tool to define multi-container applications. By the end of this tutorial, you should be able to write your own docker-compose scripts to manage systems consisting of more than just one containerized application or service.

## Prerequisites
##### Side note: There are links attached to the bottom of this tutorial for our readers who may not be familiar with the technologies used here.
1. This tutorial uses 2 different Node services to demonstrate a working example of docker-compose and assumes that the reader is familiar with Javascript, Node, Npm, etc.
2. The reader should be familiar with the fundamentals of containerization and Docker and should know how to write Dockerfiles.
3. The reader should have PostMan installed on their machine. Alternatively, one can use CLI tools such as Curl, WGet etc. to make the API calls.
4. The reader should clone this repository to their local machine before moving on to the next section.

## Why Docker Compose?
Real world applications are enormous convoluted systems composed of multiple containerized services communicating with each other. Take Netflix, for example. Netflix isn't just one giant web service responsible for handling every single feature. Their system is broken down into various containerized services, each having its own utility and performing specific functions.

It's an immensely tedious job to have multiple containerized services and fire them up one at a time on different port mappings. This is where **docker-compose** comes handy. It's an orchestration tool used to manage multi-container systems and makes the job of running different containers incredibly easy and straghtforward.

This tutorial will focus on writing a very simple docker-compose script to fire up two different containerized Node services - Posts and Comments. Both of these API services expose the following endpoints to the outside world:

1. GET /
2. POST /

The posts service lets you add a new post and retrieve the list of added posts. Below is the definition of the payload:

```
{
  "title": "SOME TITLE",
  "description": "SOME DESCRIPTION"
}
```

The comments service lets you add a new comment and retrieve the list of added comments. Below is the definition of the payload:

```
{
  "postId": ID OF THE POST,
  "message": "SOME MESSAGE"
}
```

## How to use Docker Compose

According to the official documentation, Docker Compose is already included as a part of the Docker Engine installation on Desktop Systems such as Windows, MacOS but for Linux, the process is slightly different. Refer to this link for more information - https://docs.docker.com/compose/install/

### Script

Let's take a look at the docker-compose script included in the source code.

```
version: '3.3'
services:
  posts:
    build:
      context: ./src/posts
    ports:
      - 5000:5000
  
  comments:
    build:
      context: ./src/comments
    ports:
      - 5001:5000
```

* docker-compose scripts follow the YML syntax. The first attribute in this script is `version`. Your version of docker-compose depends on the version of Docker Engine you are using. Please refer to the following documentation for more details. https://docs.docker.com/compose/compose-file/
* The next attribute in the script is `services`. All of our services are defined under this attribute.
* Next, we define our individual services. Note that indentation is critical when writing docker-compose scripts. If you are using an IDE such as VS Code, it should automatically detect YML files and do the indentation for you. In all other cases, please use the TAB key to indent. If using VIM, the TAB key may not work so use the SPACE key to correctly indent the attributes. Okay, so we call our first service `posts`.
* One tab to the right, we use the `build` attribute to define our service's build properties.
* One more tab to the right, under the `build` section, we specify the _context_ property. The `context` attribute is used to tell the compiler where our _Dockerfile_ for the service is located. In case it's located in the same directory as your docker-compose script, just say `context: .`.
* Next, we define the port mappings. The `ports` section is defined outside of the `build` section and under `posts`.
* The whole section is repeated to define the `comments` service.



### Steps to use docker-compose
1. After you clone the repository to your local machine, pull up a terminal window and cd into the directory where you cloned the repo.
2. Run the following command:

    `docker-compose up`

    This will fire up the 2 Node services on ports 5000 and 5001 respectively.

3. Open a Postman instance and test the endpoints. You should be able to use the 2 POST endpoints to add new Post/Comment records and use the GET endpoints to view a list of added entities.
4. To stop the services, use `docker-compose down`. This command stops and removes all the running containers fired up using the docker-compose script.

### Conclusion
After doing this tutorial, one should be able to use docker-compose to write their own basic docker-compose files and fire up their multi-container systems with a single command. For more information on how to use docker-compose, refer to the following documentation - https://docs.docker.com/compose/compose-file/compose-file-v3/

### Links
1. [Javascript Tutorial](https://www.w3schools.com/js/)
2. [Npm](https://www.npmjs.com/)
3. [NodeJS](https://nodejs.org/en/docs/)
4. [Express](https://expressjs.com/en/starter/hello-world.html)
5. [Docker](https://docs.docker.com/get-started/)


