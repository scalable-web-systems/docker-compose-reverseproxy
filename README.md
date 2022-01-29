# Tutorial on Docker Compose | Node

## Objective
This tutorial focuses on docker-compose and how to use this tool to define multi-container applications. By the end of this tutorial, you should be able to write your own docker-compose scripts to manage systems consisting of more than just one containerized application or service.

## Prerequisites
##### Side note: There are links attached to the bottom of this tutorial for our readers who may not be familiar with the technologies used here.
1. This tutorial uses 2 different Node services to demonstrate a working example of docker-compose and assumes that the reader is familiar with Javascript, Node, Npm, etc.
2. The reader should be familiar with the fundamentals of containerization and Docker and should know how to write Dockerfiles.
3. The reader should have PostMan installed on their machine. Alternatively, 
4. The reader should clone this repository to their local machine before moving on to the next section.

## Why Docker Compose?
Real world applications are enormous convoluted systems composed of multiple containerized services communicating with each other. Take Netflix, for example. Netflix isn't just one giant web service responsible for handling every single feature. Their system is broken down into various containerized services, each having its own utility and performing specific functions.

It's an immensely tedious job to have multiple containerized services and fire them up one at a time on different port mappings. This is where **docker-compose** comes handy. It's an orchestration tool used to manage multi-container systems and makes the job of running different containers incredibly easy and straghtforward.

This tutorial will focus on writing a very simple docker-compose script to fire up two different containerized Node services - Posts and Comments. Both of these API services expose the following endpoints to the outside world:

1. GET /
2. POST /

The posts service lets you add a new post and retrieve the list of added posts. Below is the definition of the payload:

`{
  "title": "SOME TITLE",
  "description": "SOME DESCRIPTION"
}`

The comments service lets you add a new comment and retrieve the list of added comments. Below is the definition of the payload:

`{
  "postId": ID OF THE POST,
  "message": "SOME MESSAGE"
}`

## How to use Docker Compose

According to the official documentation, Docker Compose is already included as a part of the Docker Engine installation on Desktop Systems such as Windows, MacOS but for Linux, the process is slightly different. Refer to this link for more information - https://docs.docker.com/compose/install/

### Steps
1. After you clone the repository to your local machine, pull up a terminal window and cd into the directory where you cloned the repo.
2. Run the following command:

    `docker-compose up`

    This will fire up the 2 Node services on ports 5000 and 5001 respectively.

3. Open a Postman instance and test the endpoints. You should be able to use the 2 POST endpoints to add new Post/Comment records and use the GET endpoints to view a list of added entities.


