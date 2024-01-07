# CoretimeHub

A central hub where users can perform operations on their Coretime and easily access the marketplace.

The currently supported operations via the UI are:
- Region partitioning
- Region interlacing
- Region transferring
- Naming Regions
- Region task assignment
- Cross-Chain(xcRegion) transfers

## Set up development environment

Before running the webapp locally it is required to have the proper environment set up. To be able to test all of the frontend functionality you should run the full Coretime-Mock network as described [here](https://github.com/RegionX-Labs/Coretime-Mock?tab=readme-ov-file#getting-started-with-zombienet).

### Run locally

Before running locally the environment variables must be specified properly.

1.  Install [NodeJs](https://nodejs.org/en/download)
2.  `npm i`
3.  `npm run build`
4. `npm start`
5.  Go to `http://localhost:3000` to interact with the webapp

### Run with docker

The environment variables are automatically set in the Dockerfile; however, if you modify anything, those will need to be updated accordingly.

1. Make sure to have [Docker](https://docs.docker.com/get-docker/) installed
2. To build an image run: `docker build -t corehub .`
3. To run the app: `docker run -dp 3000:3000 corehub`
4. Go to `http://localhost:3000/` to interact with the webapp
