# blogging-service

This Project provides users to register, login and add/update/delete/view their blogs and manage comments on blog posts.

---

## Requirements

For development, you will need Node.js, npm, and mysql installed in your environment.

    $ node --version
    v16.16.0.

    $ npm --version
    8.11.0

    $ mysql --version
    8.0.34

---

## Install

    $ git clone https://github.com/tars47/blogging-service
    $ cd blogging-service
    $ npm i

## Configure app

Open `/.env` replace DB_PASS with your root user password

## Configure mysql

    $ cd blogging-service
    $ mysql -u yourusername -p yourpassword yourdatabase < database-schema.sql

## Running the project

    $ npm run start
