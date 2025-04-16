Objective: Generate code for a simple Node.js (Express) web application featuring a basic login page. Instrument this application using prom-client to expose metrics related to login attempts (success/failure). Package the Node.js application and a Prometheus server into Docker containers orchestrated by Docker Compose.

Key Technologies: Node.js, Express.js, prom-client, Prometheus, Docker, Docker Compose.

Instructions:
Please generate the necessary files and code step-by-step based on the following instructions. Pay attention to file paths and specific code requirements mentioned.
Project Structure:
.
├── app/
│   ├── views/
│   │   └── login.html
│   ├── package.json
│   ├── server.js
│   └── Dockerfile
├── prometheus/
│   └── prometheus.yml
└── docker-compose.yml

Step 1: Node.js Application (app/)
app/package.json:
Generate a package.json file.
Include the following dependencies:
express: For the web framework.
prom-client: For Prometheus metrics.
body-parser: To handle form submissions.
Define a start script: "start": "node server.js".
app/views/login.html:
Create a basic HTML file.
Include a form with:
A username input field (type text).
A password input field (type password).
A submit button.
The form should POST to the /login endpoint.
app/server.js:
Require Modules: Import express, prom-client, and body-parser.
Initialize Express: Create an Express app instance.
Middleware: Use body-parser.urlencoded({ extended: false }) middleware.
Prometheus Client Setup:
Import Registry and Counter from prom-client.
Create a new Registry instance.
Define Metrics:
Create a Counter named login_attempts_total.
Help text: 'Total number of login attempts'.
Labels: status (values: 'success', 'failure').
Register this metric with the created registry.
Create a Counter named http_requests_total.
Help text: 'Total number of HTTP requests'.
Labels: method, route, status_code.
Register this metric with the created registry.
Collect Default Metrics: Configure prom-client to collect default Node.js and process metrics using the created registry (collectDefaultMetrics({ register: registry })).
Metrics Endpoint (/metrics):
Create a GET endpoint at /metrics.
Inside the handler:
Set the Content-Type header to registry.contentType.
Send the result of await registry.metrics().
Root/Login Page Route (/):
Create a GET endpoint at /.
Send the app/views/login.html file as the response. (Use path.join(__dirname, 'views', 'login.html')). Remember to require the path module.
Login Handling Route (/login):
Create a POST endpoint at /login.
Inside the handler:
Extract username and password from req.body.
Simulate Login Logic: Implement very basic login validation (e.g., check if username === 'admin' and password === 'password').
Increment Login Counter:
If login is successful, increment login_attempts_total with label { status: 'success' }. Send a "Login Successful!" response.
If login fails, increment login_attempts_total with label { status: 'failure' }. Send a "Login Failed!" response (maybe status code 401).
Generic Request Counter Middleware (Optional but Recommended):
Add middleware before your specific routes that increments http_requests_total for all incoming requests, using req.method, req.route.path (if available, might need adjustment for dynamic routes or use req.path), and the res.statusCode (capture this using res.on('finish', ...)).
Start Server:
Define a port (e.g., 3000).
Start the Express app, listening on the defined port. Log a message indicating the server is running.
app/Dockerfile:
Start from an official Node.js base image (e.g., node:18-alpine).
Set the working directory inside the container (e.g., /usr/src/app).
Copy package.json and package-lock.json (if available).
Run npm install --production (or just npm install if dev dependencies are needed for build steps, though not typical here).
Copy the rest of the application code (. .).
Expose the application port (e.g., 3000).
Define the command to run the application (CMD ["npm", "start"] or CMD ["node", "server.js"]).

Step 2: Prometheus Configuration (prometheus/)
prometheus/prometheus.yml:
Generate a basic Prometheus configuration file.
Include a global section with a scrape_interval (e.g., 15s).
Include a scrape_configs section:
Define a job named node-app (or similar).
Set static_configs:
Define one target: 'app:3000'. (app is the service name we will define in Docker Compose, 3000 is the port the Node app listens on).
Crucially, add metrics_path: /metrics under this job config to tell Prometheus to scrape the /metrics endpoint, not the root /.

Step 3: Docker Compose (docker-compose.yml)
docker-compose.yml:
Use Docker Compose file format version 3.8 or similar.
Define two services:
app service:
build: context ./app (points to the directory containing the Node.js app's Dockerfile).
container_name: node-login-app.
restart: unless-stopped.
ports: map host port 3000 to container port 3000 ("3000:3000").
prometheus service:
image: prom/prometheus:latest.
container_name: prometheus_server.
restart: unless-stopped.
ports: map host port 9090 to container port 9090 ("9090:9090").
volumes:
Mount the local ./prometheus/prometheus.yml file to /etc/prometheus/prometheus.yml inside the container.
command: --config.file=/etc/prometheus/prometheus.yml (to tell Prometheus to use the mounted config).
depends_on: (Optional but good practice) app.

Final Check:
Ensure all file paths, service names (app in docker-compose.yml and prometheus.yml), ports, and metric names are consistent across the files.