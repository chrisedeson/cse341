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
W01 Project: Contacts Part 1
Overview
This project will store Contacts (such as friends or work colleagues). This is a two week project. As described below, you will need to complete the first part of the project in Week 01, then you will finish it in Week 02.

Project Description
This project will provide an API for storing and retrieving information about contacts. These contacts will be stored in a MongoDB database and all interaction will happen through the API that you create. You will not need to create a frontend for this project, instead you are creating the API that could be used by any frontend in the future.

Overall Requirements (Due at the end of Week 02)
The overall requirements for this project (to be completed in Week 02) are:

Be sure to review the rubric in Canvas to see how you will be graded on this assignment.
The database stores the following for each contact: firstName, lastName, email, favoriteColor, and birthday.
Node project successfully connects to MongoDB.
API routes perform GET, POST, PUT, and DELETE requests that are fully functional.
API Documentation using Swagger is professional, comprehensive, relevant, and accurate.
API is published to Render and can be called from external sources.
Create a 5 to 8 minute video that goes through the items in Rubrics. Upload it to YouTube. Videos longer than the alloted time will receive a zero and will be asked to resubmit.
Submit the following links in Canvas: GitHub repo, Render site, and YouTube video.
Contacts and Users
Please note that for this assignment, you will be creating collection of Contacts with the fields mentioned. To help you see how this is done, some tutorial videos are provided that create a collection of Users that have similarly, slightly different fields.

You should use the Users collection in the videos as a guide and a pattern, but for the assignment that you complete, make sure to use Contacts with the fields specified in the assignment instructions.

Part 1 requirements (Due at the end of Week 01)
To help you make progress toward finishing this project, for this week's assignment you need to complete the following:

Set up the project and database.
Import data into the database.
Complete the GET API routes (get and get all).
Deploy the app to Render.
Then, in Week 02 you will finish the app by adding in the POST, PUT, and DELETE endpoints as well as the API Documentation.

Use Course Tools
If you have not already, create a GitHub repository for your work. In this class, you will never submit code of any kind; you will always submit links to your work. You will always use the following tools:

GitHub to store your code
Render to deploy your code
YouTube to demonstrate the functionality of your code
If you use other tools to store, deploy or demo your code, you will not receive a grade.

Set up GitHub and Initialize Node Project
Begin your project by creating a new repository for it at GitHub and initializing a new Node.js project.

The following video may be helpful in completing this step:

Direct link: https://video.byui.edu/media/t/1_u8dzgu7e

Push to GitHub and Start with Express
Complete the following steps:

Set up Express and use it to listen and return "Hello World".
Push the appropriate files to GitHub.
Direct Link: https://video.byui.edu/media/t/1_daxwlcz2

Install MongoDB and Import data
Complete the following steps:

Create a collection in MongoDB called contacts. Insert at least three documents either for people in this class or people that you know. Each document should have the following fields: firstName, lastName, email, favoriteColor, birthday.
Create an .env file to store your MongoDB connection string.
Remember, the examples in the tutorial videos show a Users collection, but you should be creating a Contacts collection for this assignment. It is similar, but slightly different.

Direct Link: https://video.byui.edu/media/t/1_4dj3ierr

Connect your node project to MongoDB
Complete the following steps:

Create a new route file in your node project called contacts.
For the following steps, use the debugger in VS Code to help understand what is going on with the data. And use a REST client of your choosing to make http requests to your web server. This REST Client works well.
Direct Link: https://video.byui.edu/media/t/1_ujfu8vdx

Add the Get and GetAll endpoints
Complete the following steps:

Create a GET request in your contacts route file that will return all of the documents in your contacts collection.
Create another GET request in your contacts route file that will return a single document from your contacts collection where an id matches the id from a query parameter.
Direct Link: https://video.byui.edu/media/t/1_0juwmhcn

Deploy and Test
Once these api routes are working, push to GitHub and test on Render to ensure everything works in that environment as well. (NOTE: The connection string stored in your .env file will not ever be pushed to GitHub, which means it won't be published to Render. You will need to add config vars to Render.)

Direct Link: https://video.byui.edu/media/t/1_r4st3h0l

Other Help with Deployment
Prepare for Submission
Ensure you include a .rest file for testing (similar to what you see in the example video).
Push to GitHub.
Publish to Render.
Create a brief video demonstrating the functionality of your assignment. Upload it to YouTube (public or unlisted).
Submit GitHub, Render, and YouTube links in Canvas.
Be sure to review the rubric in Canvas to see how you will be graded on this assignment.
Submission
When you have finished the assignment:

Return to Canvas to submit your links.
Other Links:

Return to: Week Overview | Course Home
Copyright © Brigham Young University-Idaho | All rights reserved
