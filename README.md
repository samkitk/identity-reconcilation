# Identity Reconcilation

Identity Reconciliation Backend
This repository contains the backend code for the Identity Reconciliation application. It provides the necessary APIs and functionality to reconcile and manage user identities.

# Hosted Environment

The application is hosted at http://139.59.85.184:3000

It accepts POST Request at http://139.59.85.184:3000/identify with the following body:

Either or both fields are accepted.

```json
{
  "email": "valid@email.com",
  "phone": "stringofnumbers"
}
```

The response looks something like this

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": [
      "personA@gmail.com",
      "personA1@gmail.com",
      "personA2@gmail.com",
      "personA3@gmail.com",
      "samepersonA@gmail.com"
    ],
    "phoneNumbers": ["9409xxx234", "9824xxx828", "9824xxx389"],
    "secondaryContactIds": [2, 3, 4, 7, 5, 6]
  }
}
```

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Testing](#testing)
- [About](#about)

## Installation

To get started with the project, follow the steps below:

```bash
# Clone the repository
git clone https://github.com/samkitk/identity-reconcilation.git

# Navigate to the project directory
cd identity-reconcilation

# Install dependencies
yarn install
```

Set up the environment variables by creating a `.env` file (see Configuration section for details).

## Configuration

Copy the `.env.sample` file and rename it to `.env`. Change the values in the `.env` file accordingly.

## Usage

To start the server in development environment, run the following command:

```bash
yarn dev
```

To build the project, run the following command:

```bash
yarn build
```

To deploy the server in production environment, run the following command:

```bash
yarn deploy
```

## Testing

To run the tests, run the following command:

```bash
yarn test
```

## About

- Rate Limiting with Redis: The project utilizes Redis to implement rate limiting for API requests on the /identify endpoint. Each IP address is limited to 5 requests within a 20-second timeframe. This helps to prevent abuse and ensure fair usage of the API.

- Logging with Winston and LogTail: The project incorporates the Winston logger library to handle logging. The production logs are streamed in real-time to LogTail, providing convenient and centralized log management.

- Contact Reconciliation: When two primary contacts merge into one primary contact and one secondary contact, the project automatically migrates the respective secondary contacts of the old primary contact to point towards the new primary contact. This ensures data consistency and maintains accurate relationships between contacts.

- Modularity, Type Safety, and Asynchronicity: The codebase emphasizes modularity, type safety, and asynchronous programming. The use of TypeScript enables static type checking, reducing the likelihood of runtime errors. Asynchronous operations are employed to enhance performance and responsiveness.

- Optimized Operations: Efforts have been made to optimize the code and minimize execution times. On average, local testing indicates that the request/response cycle takes approximately 1.4 seconds. However, network connections may affect the overall response time.

- Prisma Studio: The project provides access to Prisma Studio, which allows direct interaction with the underlying database. Prisma Studio can be accessed at http://139.59.85.184:5555, enabling easy exploration and management of the database.

- CI/CD with GitHub Actions: Continuous Integration and Continuous Deployment (CI/CD) are implemented using GitHub Actions. This ensures an iterative development process, where changes pushed to the dev branch trigger the CI/CD pipeline, enabling automated testing and deployment to the production environment.
