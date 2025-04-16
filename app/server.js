const express = require('express');
const bodyParser = require('body-parser');
const { Registry, Counter, collectDefaultMetrics } = require('prom-client');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Prometheus Client Setup
const registry = new Registry();
collectDefaultMetrics({ register: registry });

const loginAttemptsTotal = new Counter({
    name: 'login_attempts_total',
    help: 'Total number of login attempts',
    labelNames: ['status'],
});
registry.registerMetric(loginAttemptsTotal);

const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
});
registry.registerMetric(httpRequestsTotal);

// Generic Request Counter Middleware
app.use((req, res, next) => {
    res.on('finish', () => {
        httpRequestsTotal.inc({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode,
        });
    });
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'views')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password') {
        loginAttemptsTotal.inc({ status: 'success' });
        res.send('Login Successful!');
    } else {
        loginAttemptsTotal.inc({ status: 'failure' });
        res.status(401).send('Login Failed!');
    }
});

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', registry.contentType);
    res.send(await registry.metrics());
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
