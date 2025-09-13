CSE 341: Web Services
BYU-I logo
Home
W1
W2
W3
W4
W5
W6
W7
W02 Project: Contacts Part 2
Overview
For this assignment, you will finish the Contacts project that you started in Week 01.

Learning Objectives
By the end of this assignment you will be able to do the following:

Create a Node Project that handles http requests
Create a collection called "contacts" in MongoDB
Create a Render project that shows no errors
Construct API documentation using Swagger that includes the following routes: GET all, GET by id, PUT, Post, and DELETE
Project Description
This project will provide an API for storing and retrieving information about contacts. These contacts will be stored in a MongoDB database and all interaction will happen through the API that you create. You will not need to create a frontend for this project, instead you are creating the API that could be used by any frontend in the future.

Requirements
The overall requirements for this project (to be completed in Week 02) are:

Be sure to review the rubric in Canvas to see how you will be graded on this assignment.
The database stores the following for each contact: firstName, lastName, email, favoriteColor, and birthday.
Node project successfully connects to MongoDB.
API routes perform GET, POST, PUT, and DELETE requests that are fully functional.
API Documentation using Swagger is professional, comprehensive, relevant, and accurate.
API is published to Render and can be called from external sources.
Create a 5 to 8 minute video that goes through the items in Rubrics. Upload it to YouTube. Videos longer than the alloted time will receive a zero and will be asked to resubmit.
Submit the following links in Canvas: GitHub repo, Render site, and YouTube video.
Add the PUT, POST, and DELETE routes
In part 1 of this project, you completed the GET routes to retrieve data from the API. Now, you will add routes to create, update, and delete contacts.

Complete the following:

Create a POST route to create a new contact. All fields are required. Return the new contact id in the response body.
Create a PUT route to update a contact. This route should allow for a url similar to this: api-url-path/contacts/id-to-modify. (The id won't be modified, it will just be the means of finding a specific document in the database.) Return an http status code representing the successful completion of the request.
Create a DELETE route to delete a contact. Return an http status code representing the successful completion of the request.
You should test each of these routes thoroughly using your rest client of choice (this REST Client works well) .
Ensure you include a .rest file for testing (similar to what you see in the example video ).
The following video may be helpful:

Direct link: https://video.byui.edu/media/t/1_ny7b9yty


Add Swagger API Documentation to your project
Complete the following:

Create Swagger documentation as shown in the team activity.
With your published API (not localhost), test your swagger documentation routes to ensure they work.
Once completed, push any changes to GitHub and verify changes in Render.
Your published project must include an "/api-docs" route that has the interactive Swagger GUI.
The following video may be helpful:

Direct link: https://video.byui.edu/media/t/1_7q9t1bof


Prepare for Submission
Be sure to review the rubric in Canvas to see how you will be graded on this assignment.
Create a A 5 to 8 minute video that goes through the items in Rubrics. Upload it to YouTube.
The video demonstration should show you using the API for each of the routes you have created by using the Swagger documentation to sending requests to each route. Be sure to use your Render url for this. Also include evidence that your database is being updated. If Render isn't working, you may use localhost, but you still need to submit your Render link in this project submission. Look at the rubric to see how many points will be deducted if you use localhost in this video.
Push to GitHub.
Publish to Render.
Upload your video demonstration to YouTube (public or unlisted).
Submit the following links in Canvas: GitHub repo, Render site, and YouTube video.
Submission
When you have completed the assignment, make sure to:

Return to Canvas to submit your assignment.
Other Links:

Return to: Week Overview | Course Home
Copyright © Brigham Young University-Idaho | All rights reserved