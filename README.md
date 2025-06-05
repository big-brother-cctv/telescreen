# Telescreen

Telescreen is the web frontend for the Big Brother project. Built with Angular, it provides a modern interface for monitoring and managing cameras in real time.

## Features

- Real-time camera monitoring with video streaming
- Camera management (view, edit, delete, configure)
- User authentication (login with JWT)
- Responsive UI with Bootstrap
- Integration with the Big Brother API

## Requirements

- Node.js 18+
- npm 9+
- Angular CLI 19.2+
- (Optional) Docker

## Getting Started

Clone the repository and navigate to the `telescreen` directory:

```sh
git clone https://github.com/big-brother-cctv/telescreen.git
cd telescreen
```

Install dependencies:

```sh
npm install
```

## Development Server

Start the local development server:

```sh
ng serve
```

Open your browser at [http://localhost:4200](http://localhost:4200). The app will reload automatically on code changes.

## Building

To build the project for production:

```sh
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Running Tests

To run unit tests:

```sh
ng test
```

## Docker

To build and run the frontend with Docker:

```sh
docker build -t telescreen .
docker run -p 4200:80 telescreen
```

## Project Structure

- `src/app/`: Main application code (components, views, services)
- `src/assets/`: Static assets
- `src/index.html`: Main HTML entry point

## License

This project is licensed under the [GNU GPL v3](https://github.com/big-brother-cctv/telescreen/blob/main/LICENSE).