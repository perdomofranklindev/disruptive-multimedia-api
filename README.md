# Disruptive Multimedia API

This project utilizes the Disruptive Multimedia API to provide a robust and scalable service.

## Prerequisites

1. Node.js v20.13.0
2. npm v10.5.2

## Technology Stack

1. Prisma 5.13.0
2. Express 4.19.2
3. Nodemon 3.1.0
4. TS Node 10.9.2
5. TypeScript 5.4.5

## Installation and Setup

Installation.

```bash
   npm run clean:install
```

The database must been running; this command push the schemas. Take into consideration that this will drop the current data in the database.

```bash
   npx prisma db push
```

Run the app.

```bash
   npm run dev
```

## If you want to run Mongo DB locally on Linux

[Here the repository](https://github.com/perdomofranklindev/dockerized-mogondb)