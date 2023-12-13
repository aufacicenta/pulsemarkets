# Prompt Wars

Originally branded as Pulse Markets and built for the NEAR Blockchain, Prompt Wars is now a decentralized game build for EVM compatible wallets.

The reasoning behind the game is simple:

> Submit a prompt that will render the image on display, compare all the prompt results with the source image and pay the rewards to the resulting image that is closest to the reference image.

![Prompt Wars screenshot](https://blockchainassetregistry.infura-ipfs.io/ipfs/bafybeidycxac3jfzxd6c66luugcfks2ghuo423ukphdwnet753wy7n7tam/Screenshot%202023-07-07%20at%2012.42.32.png)

Follow [docs.pulsemarkets.org](https://docs.pulsemarkets.org/pulse-markets/) for a broader understanding of the smart-contract Prediction Markets protocol on top of which Prompt Wars is built.

- [Development](#development)
- [Launching-client](#launching-client)
- [Solidity Development](#solidity-development)
- [API](#api)
- [Contributing](#contributing)

<a name="development"/>

## Development

To launch your own instance of Prompt Wars, you can:

1. connect to our Testnet or Mainnet contracts, OR
2. connect to your own contracts

<a name="launching-client"/>

### Launching the frontend client

The client is a NextJS application that connects to the NEAR Protocol Rust smart-contracts with `near-api-js`.

To launch on `localhost:3003`, first clone this repo and run:

```bash
git@github.com:aufacicenta/pulsemarkets.git
cd pulsemarkets
yarn
cd app
yarn
yarn dev:debug
```

You'll need these values in `app/.env`:

```bash
export NODE_ENV=test
export NEXT_PUBLIC_ORIGIN="http://localhost:3003"

export NEXT_PUBLIC_INFURA_ID="..." # get it from infura.io, works to upload prompt images to IPFS

# Uncomment when ready to prod
# export NEXT_PUBLIC_DEFAULT_NETWORK_ENV="mainnet"

export NEXT_PUBLIC_DEFAULT_NETWORK_ENV="testnet"

export NEAR_SIGNER_PRIVATE_KEY="..." # a private key of your NEAR wallet account. This wallet creates the games and determines the winner

export REPLICATE_API_TOKEN="..." # get it from replicate.ai, this connects to Stable Diffusion to compare the images

export NEXT_PUBLIC_WEBSOCKETS_PORT=8000
```

<a name="solidity-development"/>

## Solidity Development

### Building contract Instructions

Whenever you make changes to `solidity/prompt-wars` contracts and compile them either with `npx hardhart compile`, or `npx hardhat test`, you should execute this:

```bash
yarn typechain --target=ethers-v6 --out-dir app/src/providers/evm/contracts/prompt-wars solidity/promptwars/artifacts/contracts/Market.sol/Market.json
```

This command will generate the ethers-v6 typings used in the app.

<a name="api"/>

## Creating new games

This is done through the API endpoints:

- `/api/prompt-wars/create` — create new games using the market factory contract (once this is called, it automates the next steps)
- `/api/prompt-wars/reveal` — compare the prompt results with the source image, store the results in the prompt wars market contract
- `/api/prompt-wars/resolve` — set the winner
- `/api/prompt-wars/self-destruct` — get the storage NEAR native balance back

<a name="contributing"/>

## Contributing

Check the paid issues in the [Prompt Wars project board](https://github.com/orgs/aufacicenta/projects/2)!