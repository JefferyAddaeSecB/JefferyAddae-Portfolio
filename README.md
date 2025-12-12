
🚀 Jeffery Portfolio v3
A modern, responsive portfolio website built with React, TypeScript, and Tailwind CSS.

✨ Features
🎨 Modern and clean design
🌓 Dark/Light mode support
📱 Fully responsive
⚡ Fast and optimized performance
🎭 Smooth animations and transitions
🔍 SEO optimized
📊 Animated skill bars
🖼️ Project showcase
💬 Contact form with email integration
🔗 Social media integration
🛠️ Tech Stack
Framework: React
Language: TypeScript
Styling: Tailwind CSS
Icons: Remix Icons
Animations: Framer Motion
Email Service: Nodemailer
Routing: Wouter
Deployment: Vercel
📍 Location
The portfolio website is managed from: Toronto, Ontario, Canada

<<<<<<< HEAD
- 🎨 Modern and clean design
- 🌓 Dark/Light mode support
- 📱 Fully responsive
- ⚡ Fast and optimized performance
- 🎭 Smooth animations and transitions
- 🔍 SEO optimized
- 📊 Animated skill bars
- 🖼️ Project showcase
- 💬 Contact form with email integration
- 🔗 Social media integration

## 🛠️ Tech Stack

- **Framework:** React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Remix Icons
- **Animations:** Framer Motion
- **Email Service:** Nodemailer
- **Routing:** Wouter
- **Deployment:** Vercel

## 📍 Location

The portfolio website is managed from:
Toronto,Ontario Canada

## 📞 Contact

- **Email**: jeffaddai40@gmail.com
- **Phone**: +1 (437) 499-1703
- **Location**: Toronto, Onatario. Canada
## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JefferyAddaeSecB/JefferyAddae-Portfolio.git
cd JEFF-PORTFOLIO-master
```

2. Install dependencies:
```bash
=======
📞 Contact
Email: jeffaddai40@gmail.com
Phone: +1 (437) 499-1703
Location: Toronto, Ontario, Canada
🚀 Getting Started
Prerequisites
Node.js (v16 or higher)
npm (v7 or higher)
Installation
Clone the repository:
git clone (https://github.com/JefferyAddaeSecB/JefferyAddae-Portfolio.git)
cd JEFF-Portfolio-master
Install dependencies:
>>>>>>> 56bd50c (chore: save current changes)
cd client
npm install
Running the Application
Development Mode
To run the application in development mode with hot reloading:

cd client
npm run dev
This will start the development server at http://localhost:5173

Production Mode
To build and preview the production version:

Build the application:
cd client
npm run build
Preview the production build:
npm run preview
This will start a preview server at http://localhost:4173

Important Notes
Always run commands from the client directory
The development server (dev mode) provides hot reloading for faster development
The preview server (production mode) shows exactly how the site will look when deployed
Make sure to rebuild (npm run build) after making changes to see them in production mode
�️ Server (API) — running locally
This repository includes a small Express-based server in the server/ folder that exposes a couple of API endpoints and can optionally serve the built frontend.

Running the server in development
The project has a dev script that starts the TypeScript server with file watching. From the repository root run:

npm run dev
This will start the server on port 3000 by default (see the PORT environment variable). Example output when the server starts:

Environment Configuration: {
	NODE_ENV: 'development',
	EMAIL_USER: undefined,
	HAS_EMAIL_PASSWORD: false,
	PORT: '3000'
}

🚀 Server is running!
📝 Environment: development
📧 Email configured: false
🌐 Server URL: http://localhost:3000
🎨 Frontend URL: http://localhost:3000

📋 Available endpoints:
	 - GET  /api/test-email
	 - POST /api/contact

💡 Tip: Use Ctrl+C to stop the server
Common issue: "Cannot GET /"
If you open http://localhost:3000 in your browser and see "Cannot GET /" it means the Express server isn't serving the frontend at the root path. There are two common ways to run the frontend together with the server:

Development (recommended while working on the UI): run the Vite dev server separately from the client/ folder. In a separate terminal:
cd client
npm run dev
The Vite dev server serves the frontend on a different port (usually 5173). Open the Vite URL (it will log the exact port) to see the app with HMR.

Production / preview (serve built static files via the server): build the frontend and start the server in production mode. From the root:
cd client
npm run build
cd ..
npm run build  # the root build script copies the client build into dist/public and bundles the server
npm start
This will let the Express server serve the built frontend at / (so the server will load the site when using the start script with NODE_ENV=production).

Note about ports and deployments

The development script in this repo uses port 3000 by default for the server (used when running npm run dev at the project root).
In production the platform (Render, Vercel, Heroku, etc.) will provide a PORT environment variable; the app reads process.env.PORT at startup and binds to that port. Do not hard-code a port in the start script — the project has been updated so the platform controls the port automatically.
If you need to override the local development port, set PORT in a local .env file or update the dev script in package.json.

If you want me to make the server print the resolved port on startup (handy for debugging deployments), I can add a small log line.

If you prefer the dev server and the API on the same origin during development, the server includes Vite middleware in development — make sure the server logs show the Vite middleware initialized. If you still get "Cannot GET /", either:

the server didn't initialize the Vite middleware (check for errors in the server output), or
you are hitting the server port instead of the Vite dev server (open the Vite URL printed by client/npm run dev).
If you want help wiring the server to always serve the client root during development, I can add a small redirect or static-serve fallback to server/index.ts so GET / returns the app.

Email (SMTP) and Gmail App Password
The server uses Nodemailer to send contact form emails. For reliable SMTP delivery when using a Gmail account, use a Gmail App Password (recommended) instead of your regular account password.

Quick steps to create and use a Gmail App Password:

Enable 2-Step Verification for your Google account: https://myaccount.google.com/security -> "2-Step Verification".
Create an App Password: https://myaccount.google.com/security -> "App passwords". Choose "Mail" or "Other" and give it a name like "Portfolio SMTP".
Copy the 16-character App Password (Google displays with spaces for readability). Use the contiguous string (no spaces) as the value for EMAIL_PASSWORD.
Set the following environment variables (locally in .env or in your hosting provider's secrets):
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=<your-app-password>
FROM_EMAIL=onboarding@yourdomain.com   # optional; defaults to EMAIL_USER
ADMIN_EMAIL=you@yourdomain.com         # where admin notifications are sent
Notes:

<<<<<<< HEAD

## �📁 Project Structure

```
=======
If FROM_EMAIL differs from EMAIL_USER, Gmail may rewrite or block the From header. If you have issues, temporarily set FROM_EMAIL to the same value as EMAIL_USER to verify SMTP is working.
Do NOT commit .env with secrets. Use your host's environment/secret manager (Render, Vercel, etc.) for production credentials.
�📁 Project Structure
>>>>>>> 56bd50c (chore: save current changes)
JEFF-Portfolio-master-v3/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── styles/
├── server/
│   ├── routes/
│   ├── services/
│   └── vite.ts
├── public/
└── package.json
🎨 Customization
Update your personal information in client/src/lib/constants.ts
Modify the theme colors in client/src/styles/globals.css
Add your projects in the PROJECTS array
Update social media links in SOCIAL_LINKS
Configure email settings in .env
📱 Responsive Design
The portfolio is fully responsive and optimized for:

📱 Mobile devices
💻 Tablets
🖥️ Desktop screens
🔧 Built With
React - JavaScript library
TypeScript - Type safety
Tailwind CSS - Styling
Remix Icons - Icon library
Framer Motion - Animations
Nodemailer - Email service
Wouter - Routing
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

�� Contributing
Contributions, issues, and feature requests are welcome! Feel free to check issues page.

👤 Author
Jeffery Addae

<<<<<<< HEAD
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## �� Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/JefferyAddaeSecB/JefferyAddae-Portfolio/issues).

## 👤 Author

**Jeffery Addae**
- GitHub: [@JefferyAddaeSecB](https://github.com/JefferyAddaeSecB)
- LinkedIn: [Felix Ashong](www.linkedin.com/in/jeffery-addae-297214398)


## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Remix Icons](https://remixicon.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Nodemailer](https://nodemailer.com/)
- [Wouter](https://github.com/molefrog/wouter) 
=======
GitHub: @JefferyAddaeSecB
LinkedIn: Jeffery Addae
🙏 Acknowledgments
React
Tailwind CSS
Remix Icons
Framer Motion
Nodemailer
Wouter
>>>>>>> 56bd50c (chore: save current changes)
