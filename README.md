# CoinList Partner Demo

This is a demo website demonstrating the integration with CoinList using the
`@coinlist-co/react` SDK. It's live at [partner.coinlist.dev](https://partner.coinlist.dev/) 🚀

We recommend reading [the official CoinList documentation](https://docs.coinlist.co/) while
exploring the source code.

## Running locally

1. Provide the environment variables
```shell
cp .environments/.env.example .env
```
2. Update `NEXT_PUBLIC_COINLIST_CLIENT_ID` and `COINLIST_CLIENT_SECRET` with the credentials provided by CoinList. If you don't have them, ask your CoinList contact to provide them. You can still use the app with the dummy values from `.env.example`, but you won't be able to complete OAuth.
3. Run the Next.js app locally:
```shell
npm run dev
```

## Optional: Nix development setup

Your own Node and npm work fine — everything above assumes them. This section is only for
those who prefer a reproducible toolchain: `flake.nix` pins Node 24 and TypeScript, and
`flake.lock` freezes the exact versions, so every machine gets an identical setup.

1. Install Nix with the [Determinate Systems installer](https://github.com/DeterminateSystems/nix-installer),
   which enables flakes out of the box and supports clean uninstalls:
```shell
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
```
2. Install [direnv](https://direnv.net/) and [nix-direnv](https://github.com/nix-community/nix-direnv)
   (direnv on its own does not provide `use flake`).
3. Activate the dev shell — from then on it loads automatically whenever you `cd` into the repo:
```shell
direnv allow
```

Without direnv, enter the same shell manually with `nix develop`. Either way, JS dependencies
still come from `npm install` — the flake provides the toolchain, not `node_modules`.
