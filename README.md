# URLMonitor
## RESTful API for an uptime monitoring application; Done with Node.js and with no external packages

It allows users to enter URLs they want monitored, and receive alerts when those resources "go down" or "come back up".

API Functionality:
1. The API listens on a PORT and accepts incoming HTTP requests
2.  The API allows a client to connect, create a new user, edit and delete said user
3. The API allows a user to "sign in", giving them a token for further authentication
4. The API allows the user to "sign out"
5. The API allows a signed-in user to create a new "check URL" with their token, along with editing and deleting users.
6. Workers perform all the "checks" in the background, and send alerts to the users when a check changes status

GUI Functionality:
1. Signup
2. Login and Logout
3. Modify their account
4. Delete their account
5. Create, update and delete checks
6. View a dashboard with all of the checks