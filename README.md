
CS 3984, Exercise 5.

In this exercise, we will be writing a simple REST API that manages users,
handles authentication, and connects to a database.
Users can be regular users or 'admin' users.

To make your job easier, you are given the unit tests and have to write
the corresponding API.

Set up your config/test.json file with the necessary information on how
to access the database.  Make sure that you have created the database and have
given yourself access to it to drop and create tables.

Step 1:
-------

Create the `users` table. 
Create a file sql/createdb.sql that creates your users table.
You may use phpadmin to set up this table, then use mysqldump to create the necessary file.
Your table should record a user id (numeric), a user-chosen username, a hashed password,
a first and a last name, and a boolean flag whether this user is an administrator. 

You will recreate the users table before each jasmine test run.

Step 2:
-------

Create the authentication API.

Your API should support the following operations:

+ GET

    - `/api/users`          - return the first 10 users.
    - `/api/users?page=1`   - return users 11-20
    - `/api/users?page=n`   - return users 10*n + 1 ... 10*n + 10
    - `/api/users/:id`      - get information about a user

+ POST

    - `/api/users`          - create a new user.
    - `/api/login`          - authenticate as a user.

+ PUT

    - `/api/users/:id`      - update information for user id

+ All operations except for the POSTs should require authentication.
The operations that take an :id should check that either the
id belongs to an admin or that it is the id of the requesting user.

+ Your database code should be clearly separated from the API code.
Keep your db code in db/queries.js for which you will find a stub
that shows you the six methods my sample solution implements.

+ To implement authentication, use passport.
api.js contains some boilerplate code already to enable session
management and install the passport middleware.

+ You will need to implement a LocalStrategy in api/users.js and make
express use it.

+ To add a middleware that ensures the user is authenticated when an
API entry point is hit, do not use the connect-ensure-login npm,
because it is intended for pages needing redirection upon 
lack of authentication.  Instead, write your own connect-style
middleware.

Step 3:
-------

When done, you run the tests like so:

```
    $ mysql -u... -p... db2 < sql/createdb.sql 
    $ node_modules/.bin/jasmine spec/userapitests.js
```

(always recreate the database, the tests assume an empty table)

