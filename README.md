# CoinList Partner Demo

This is a demo website demonstrating the integration with CoinList using the
`@coinlist-co/react` SDK. It's live at [partner.coinlist.dev](https://partner.coinlist.dev/) 🚀

We recommend reading [the official CoinList documentation](https://docs.coinlist.co/) while
exploring the source code.

> **Pre-release note:** this branch pins a local SDK build via
> `file:coinlist-co-react-0.7.0.tgz` because `@coinlist-co/react@0.7.0` (the
> external-wallet UI) isn't published yet.
>
> **TODO: publish `@coinlist-co/react@0.7.0`, switch this dependency back to a
> registry range (`^0.7.0`), and `git rm` the tarball BEFORE merging this branch.**

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
