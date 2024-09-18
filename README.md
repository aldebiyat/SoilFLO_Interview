<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

The Ticket Management API is a NestJS-powered application designed to manage tickets for trucks and construction sites. It supports bulk ticket creation, ticket filtering by site and date range, and ensures compliance with business rules such as preventing future dispatch times and avoiding duplicate dispatched times for the same truck.

## Features

- Bulk Ticket Creation: Easily create multiple tickets for different trucks and sites in a single request.
- Ticket Filtering: Retrieve tickets based on site and a specific date range.
- Business Rules:
  - Prevent tickets from being dispatched in the future.
  - Ensure no two tickets for the same truck share the same dispatched time.

## Setup Instructions

### 1. Prerequisites

Make sure you have the following installed:

- Node.js (v16.x or later)
- npm (v8.x or later)

```bash
brew install node
node -v
npm -v
```

- PostgreSQL DB

```bash
Download PG Admin
```

- NestJS (v10.x or later)

```bash
npm install -g @nestjs/cli
nest --version
```

### 2. Installation

#### A. Create Postgres DB:

1. Download and open pgAdmin.
2. Connect to your PostgreSQL server.
3. Right-click on "Databases" and select "Create > Database..."
4. Enter a name for your database and select an owner.
5. Click "Save" to create your database.

#### B. Clone the repository:

```bash
git clone <repository-url>
cd <repository-directory>
```

#### C. Install dependencies:

```bash
npm install
```

#### D. Configure the environment:

Create a .env file at the project root with the following variables:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=your_db_name
DB_SYNCHRONIZE=true or false (depends on environment)
```

#### E. Start the application:

```bash
npm run start:dev
```

#### F. Run tests:

Run all tests.

```bash
npm run test
```

#### G. Import Data To DB:

After running the project, you need to check DB if **Site, Truck and Ticket** tables were created.
And after checking the tables you need to start importing data from both files **SitesJSONData.json and TrucksJSONData.json** to your DB so you can be able to test the server with data.
Files are found here.

```text
https://github.com/SoilFLO/interview-takehome-be
```

## Test API using _Postman_:

### 1. Base URL

All endpoints are prefixed with

```bash
http://localhost:3000
```

### 2. Postamn API Requests Path:

Where you can fins all postman requests **Create, GetByID, GetAll, Update and Delete** for **Sites, Trucks and Tickets**

```bash
src/postman
```

Import the both **postman_api_env.json and postman_api_requests.json** files to postman and start testing the server.

### 3. Example Endpoints

#### A. Create Tickets in Bulk

- Method: POST
- Endpoint: /tickets/bulk-create
- Example:

```json
{
  "tickets": [
    {
      "truckId": 1,
      "siteId": 1,
      "dispatchedTime": "2024-09-16T10:00:00.000Z"
    },
    {
      "truckId": 2,
      "siteId": 1,
      "dispatchedTime": "2024-09-16T10:05:00.000Z"
    }
  ]
}
```

#### B. Filter Tickets

- Method: GET
- Endpoint: /tickets/filter
- Query Parameters:
- siteId (optional): Filter by site.
- startDate and endDate (optional): Filter by date range.
- Example:

```bash
GET /tickets/filter?siteId=1&startDate=2024-09-16T00:00:00.000Z&endDate=2024-09-17T00:00:00.000Z
```
