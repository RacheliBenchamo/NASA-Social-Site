# NASA Social Site: MVC (NodeJS-Express-EJS) and Database

Author: Racheli Benchamo

Embark on a cosmic journey with daily NASA images. This web application offers a unique blend of space exploration and social interaction, allowing users to comment on captivating space visuals.

This project is a web application that allows users to view the image of the day from NASA and leave comments on the images. The application is built using a combination of technologies including Express.js, EJS, JavaScript, HTML, and CSS. The application is built using the MVC (Model-View-Controller) pattern, with Node.js and Express.js as the server-side technology, and EJS as the template engine. This application also utilizes a relational database to store the users and their comments. This allows for the linking of user information with their respective comments, providing a more robust and efficient method for managing the data. Users can add and delete comments on the images, and the application allows for dynamic updates to the page as comments are added or deleted.

This project demonstrates a solid understanding of web development principles and technologies, including server-side and client-side programming, database management, and web application design.

## Features

- **User Registration**: Securely register and log in to access the feed.
- **Daily NASA Images**: Fetches daily space images from NASA's Astronomy Picture of the Day database.
- **User Comments**: Add, view, and delete comments on images. Each comment is limited to 128 characters.
- **Infinite Scrolling**: Easily access the rest of the feed of photos with infinite scrolling, loading the next 3 photos as you reach the end.

## Technologies Used

- **Backend**: Express
- **Frontend**: EJS
- **Database**: Sequelize
- **Authentication**: bcrypt
