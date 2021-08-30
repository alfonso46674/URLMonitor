# URLMonitor
## RESTful API for an uptime monitoring application; Done with Node.js and with no external packages

It allows users to enter URLs they want monitored, and receive alerts when those resources "go down" or "come back up".

## Getting started
```
node index.js
```
## Functionality
### API Functionality:
1. The API listens on a PORT and accepts incoming HTTP requests
2.  The API allows a client to connect, create a new user, edit and delete said user
3. The API allows a user to "sign in", giving them a token for further authentication
4. The API allows the user to "sign out"
5. The API allows a signed-in user to create a new "check URL" with their token, along with editing and deleting users.
6. Workers perform all the "checks" in the background, and send alerts to the users when a check changes status

### GUI Functionality:
1. Signup
2. Login and Logout
3. Modify their account
4. Delete their account
5. Create, update and delete checks
6. View a dashboard with all of the checks

### CLI Commands:
1. exit - Exit the application
2. man / help - Returns information regarding a command or the application
3. stats - Returns everything about the OS and related systems
4. list users - Lists all the registered users
5. more user info --{userId} - Returns information about a specific user
6. list checks --up / --down - Lists all the checks, or filter them if they are up or down
7. more check info --{checkId} - Returns information about a specific check
8. list logs - Lists all of the logs in the system
9. more log info --{logId} - Returns information about a specific log