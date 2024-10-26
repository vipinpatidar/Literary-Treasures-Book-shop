## Literary Treasures - Book Shop Website

Literary Treasures is a server-side rendered book shop website where users can explore, purchase, and manage books. The website provides features like browsing books, adding new books, updating and deleting owned books, and managing a shopping cart for book purchases.

## Live At-

https://literary-treasures-book-shop-server.onrender.com/

## Features

- Book Browsing: Users can explore a collection of books available for purchase.
- Book Purchase: Add books to the shopping cart and proceed to purchase.
- Book Management: Registered users can add, update, and delete books they own.
- Shopping Cart: Users can manage their shopping cart, adding, removing, and updating book quantities.

## Installation

### Using Docker

<summary><code>Dockerfile</code></summary>

```Dockerfile

ARG NODE_VERSION=20.11.0

FROM node:${NODE_VERSION}-alpine

WORKDIR /app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Run the application as a non-root user.
USER node

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD node app.js

```

</details>

#### add a .env file in directory with environment variables like

      #PORT=3000
      #MONGODB_URL=your mongodb url
      #STRIPE_KEY= your Stripe secret key
      #STRIPE_PUBLIC_KEY= your Stripe public key

<details>
<summary><code>docker-compose.yaml</code></summary>

```dockerfile

# specify the version of docker-compose
version: "3.8"

services:
  ssrapp:
    # api service depends on the db service so the db service will be started before the api service
    depends_on:
      - db

    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - 3000:3000
    environment:
      - PORT=${PORT}
      - MONGODB_URI=${MONGODB_URI}
      - STRIPE_KEY=${STRIPE_KEY}
      - STRIPE_PUBLIC_KEY=${STRIPE_PUBLIC_KEY}

      # establish docker compose watch mode for the api service
    develop:
      # specify the files to watch for changes
      watch:
        # it'll watch for changes in package.json and package-lock.json and rebuild the container and image if there are any changes
        - path: ./package.json
          action: rebuild
        - path: ./package-lock.json
          action: rebuild

        # it'll watch for changes in the api directory and sync the changes with the container real time
        - path: ./
          target: /app
          action: sync

  # define the db service
  db:
    # specify the image to use for the db service from docker hub. If we have a custom image, we can specify that in this format
    # In the above two services, we're using the build context to build the image for the service from the Dockerfile so we specify the image as "build: ./frontend" or "build: ./backend".
    # but for the db service, we're using the image from docker hub so we specify the image as "image: mongo:latest"
    # you can find the image name and tag for mongodb from docker hub here: https://hub.docker.com/_/mongo
    image: mongo:latest
    ports:
      - 27017:27017
    # restart the container if it crashes
    restart: always

    # specify the volumes to mount for the db service
    # we're mounting the volume named "bookShopDB" inside the container at /data/db directory
    # this is done so that the data inside the mongodb container is persisted even if the container is stopped
    volumes:
      - bookShopDB:/data/db

# define the volumes to be used by the services
volumes:
  bookShopDB:

```

</details>

#### Creating Images and container from .yaml file

1.  Running in watch mode

    docker-compose watch

2.  Without watch mode

    docker-compose up

3.  Stop and Remove containers

    docker-compose down

### Prerequisites

- Node.js and npm installed globally.
- MongoDB instance.

## Setup

1. Clone the repository:
   git clone https://github.com/yourusername/wandernest.git
2. Navigate to the backend directory:
   cd literary-treasures
3. Install dependencies:
   npm install

4. Create a .env file in the backend directory and add the following variables:

MONGODB_URL=your_mongodb_connection_url
PORT=your_preferred_port_number

5. Start the backend server: node index.js

## Usage

- Explore the collection of books available on Literary Treasures.

- Register for an account to access additional features like adding, updating, and deleting books you own.

- Add books to your shopping cart by clicking the "Add to Cart" button on book pages.

- Manage your shopping cart by adding, removing, and updating book quantities.

- Proceed to checkout to complete your book purchases.

- If you're a registered user, use the book management features to add, update, and delete books you own.

Happy reading with Literary Treasures! 📚✨
