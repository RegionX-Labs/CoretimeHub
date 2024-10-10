# CoretimeHub

A central hub where users can perform operations on their Coretime and easily access the marketplace.

The UI currently supports:

### `/regions`
- Region partitioning
- Region interlacing
- Region transferring
- Naming Regions
- Region task assignment
- Listing regions on sale

### `/transfer`
- Cross-Chain Region transfers (RegionX parachain <-> Coretime chain)
- Cross-Chain token transfers

### `/purchase`
- Bulk sale dashboard
- Core procurement

### `/paras`
- Parachain dashboard
- Parachain Id reservation
- Parachain code registration

### `/renew`
- Core renewal

### `/marketplace`
- Browsing regions listed on sale
- Purchasing regions from the market
- Unlisting regions from the market

### `/orders`
- Coretime order creation
- Coretime order contribution

## Set up development environment

Before running the webapp locally it is required to have the proper environment set up. To be able to test all of the frontend functionality you should run the full Coretime-Mock network as described [here](https://github.com/RegionX-Labs/Coretime-Mock?tab=readme-ov-file#getting-started-with-zombienet).

### Run locally

Before running locally the environment variables must be specified properly.

1.  Install [NodeJs](https://nodejs.org/en/download)
2.  `npm i`
3.  `npm run build`
4.  `npm start`
5.  Go to `http://localhost:3000` to interact with the webapp

### Run with docker

The environment variables are automatically set in the Dockerfile; however, if you modify anything, those will need to be updated accordingly.

1. Make sure to have [Docker](https://docs.docker.com/get-docker/) installed
2. To build an image run: `docker build -t coretime-hub .`
3. To run the app: `docker run -dp 3000:3000 coretime-hub`
4. Go to `http://localhost:3000/` to interact with the webapp

### Testing cross-chain region transfers

1. Build the [RegionX-Node](https://github.com/RegionX-Labs/RegionX-Node)
2. Follow the [Getting started with zombienet](https://github.com/RegionX-Labs/Coretime-Mock?tab=readme-ov-file#getting-started-with-zombienet) steps and run `npm run zombienet`
3. Set up the environment by running the [initialization script](https://github.com/RegionX-Labs/Coretime-Mock?tab=readme-ov-file#example-setting-up-the-full-environment) after the parachains started producing blocks.
4. Set the environment variables to the following:

```.env
WS_KUSAMA_RELAY_CHAIN="ws://127.0.0.1:9900"
WS_KUSAMA_CORETIME_CHAIN="ws://127.0.0.1:9910"
WS_REGIONX_PASEO_CHAIN="ws://127.0.0.1:9920"
EXPERIMENTAL=true
```

5. Run `npm run dev`
6. Purchase a core from the bulk market
7. Cross chain transfer the core from the Coretime chain to the RegionX parachain.
8. Upon successful transfer the region record should be set on the RegionX parachain, and you should see the region location set to `RegionX chain`.
