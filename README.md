# CoinList Partner Demo

This is a demo website demonstrating the integration with CoinList using the
`@coinlist-co/react` SDK. It's live at [partner.coinlist.dev](https://partner.coinlist.dev/).

We recommend reading [the official CoinList documentation](https://docs.coinlist.co/) while
exploring the source code.

## Running locally

1. Provide the environment variables
```shell
cp .environments/.env.example .env
```
2. Update the `NEXT_PUBLIC_COINLIST_CLIENT_ID` and `COINLIST_CLIENT_SECRET` with your CoinList provided credentails. If you don't have one, ask your CoinList content to provide you with such. You can still play with app even with the dummy values from `.env.example` but you won't be able to complete OAuth.
3. Run the NextJS app locally:
```shell
npm run dev
```
