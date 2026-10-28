# QA

The partner demo is the default host for QA of the Passage SDK
(`@passage-cl/react`): QA either tests this repo's own changes or hosts an SDK
change built from source. What the SDK's UI should show is in the SDK
repository's own `QA.md`. When the two disagree, this file wins for facts
about the demo.

## Run the app

Next 16 with npm. The toolchain (Node 24, `just`) is pinned by `flake.nix`;
run every `npm` and `just` command inside the flake
(`nix develop <repo> -c ...`).

Never touch the user's checkout (`../partner-demo`). Work in a throwaway
worktree under a scratch directory outside every repo (`$S` below). The
checkout's `.env` is already filled in; if it is missing, ask the user to set
it up (README, "Running locally"); never invent env values.

1. `git -C ../partner-demo fetch origin` and
   `git -C ../partner-demo worktree add --detach $S/partner-demo <ref>`,
   where `<ref>` is the PR head, or `origin/main` when hosting an SDK change
   that names no demo ref.
2. In `$S/partner-demo`: `cp ../partner-demo/.env .`, then `npm ci`.
3. Hosting an SDK change: `just install-from-source <sdk path>`, passing the
   SDK worktree's path. The recipe packs the SDK, installs the tarball and
   verifies the installed build is the one just packed. A failed
   verification means the app would run the old SDK: stop, do not QA it.
4. Start the dev server in the background: `npm run dev`. It must serve on
   **port 3000**, because the OAuth redirect URI in `.env` is
   `http://localhost:3000/oauth/coinlist/callback`. Check the port is free
   first (`lsof -iTCP:3000 -sTCP:LISTEN`); if the user's own dev server holds
   it, ask them to stop it. Ready when `curl -sf http://localhost:3000`
   returns 200.
5. At the end, stop the server and
   `git -C ../partner-demo worktree remove --force $S/partner-demo`.

`NEXT_PUBLIC_CHAIN` stays unset, so the demo runs on Sepolia. Never set it to
`ethereum_mainnet`.

## Accounts and login

One role, auth state `user`, saved at
`~/.cache/qa/coinlist/partner-demo/auth/user.json`.

Login is CoinList OAuth from the demo's sign-in card. **No credentials are
provided, and QA never asks for or types them.** The user logs in themselves:

1. With the dev server up, ask the user, then open Chromium **headed** on
   `http://localhost:3000` (a script that waits for the tab to close, then
   saves `context.storageState` to `user.json`).
2. The user clicks the CoinList button on the sign-in card ("Sign in to
   participate"), completes OAuth, waits for the home page with the offers
   and closes the tab.
3. Check the saved state headless: the home page shows no sign-in card.

The session is the httpOnly `coinlist_session` cookie on `localhost:3000`, so
`storageState` carries it to any worktree. Reuse it until the home page shows
the sign-in card again, then ask the user to log in again the same way.

The account must be KYC-approved and non-US: Ondo assets are only offered to
non-US investors. That is a precondition the user owns. If the requirements
checklist shows identity verification, jurisdiction or a document as not
completed, ask the user; QA does not complete KYC.

## Wallet

The demo connects external wallets through Reown AppKit over wagmi, which
discovers injected EIP-6963 wallets. Use the `qa-wallet` helper:

```js
const { installWallet } = require('qa-wallet');
// Before the first goto.
const { address, rejectNext } = await installWallet(context, {
  keyFile: process.env.QA_EVM_KEY_FILE,
  rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
  chainId: 11155111,
  // Headless, AppKit's rpc.walletconnect.org answers 400, so wagmi's receipt
  // waits never end: the checkout reports a failed approval or an
  // unconfirmed transaction although the transactions mine.
  forwardRpc: [/^https:\/\/rpc\.walletconnect\.org\/v1\//],
});
```

- Available only when `printenv QA_EVM_KEY_FILE >/dev/null` succeeds. Never
  read that file.
- AppKit's modal opens from the checklist's "Connect wallet" action and from
  the checkout's "External wallet" row. Pick the injected wallet named
  "QA Wallet" (rdns `dev.qa.wallet`), never WalletConnect. In the checkout
  the QA Wallet is then the one wallet offered, already connected, shown by
  its short address.
- AppKit renders in shadow DOM; Playwright locators pierce its open shadow
  roots, so `getByText('QA Wallet')` finds the row.
- AppKit keeps its connection in `localStorage`, which `storageState` saves
  too, so a restored context may open already connected.
- The `external_wallet` requirement asks the wallet to sign an ownership
  challenge (`personal_sign`); the helper signs it. Once the backend has it,
  it stays completed for that account.
- A `whitelisted_wallet` requirement is an allowlist on CoinList's side. If it
  is not completed for the QA wallet, ask the user to arrange it.

Funds, checked before planning:

```sh
qa-wallet balance --rpc https://ethereum-sepolia-rpc.publicnode.com \
  --erc20 0x1c7d4b196cb0c7b01d743fbc6116a902379c7238 \
  --erc20 <offer token address>
```

- Sepolia ETH for gas: an order sends an approval and then the swap. About
  0.01 ETH covers a run.
- Sepolia USDC (`0x1c7d…7238`) for a buy: Ondo settles in USDC. 1 USDC per
  order is enough; a run places two or three.
- The offer's token for a sell; a buy is the way to get it. Its
  `ethereum_sepolia` address is in the SDK's token registry,
  `passage.tokens.list()`.

When a balance is short, tell the user the shortfall and ask them to top it
up. Never treat a short balance as a product bug.

## Test data

No fixtures and no reset: offers, requirements and orders are live data.
Every placed order spends testnet funds and stays on the account, so keep
amounts small. The demo serves Sepolia offers only.

## Key flows

The Ondo swap, buy then sell, through the SDK's `CheckoutContainer`:

1. Home (`/`) lists offers by provider; open one under the Ondo heading (an
   `ondo::swap` offer, `/offer/<id>`). Pick one whose token has a Sepolia
   swap contract and a Sepolia address in the token registry; pick an
   option, then Continue.
2. Requirements checklist: every item completed, connecting the wallet and
   signing ownership if needed.
3. "Buy" (or "Sell", shown only for sellable offers) replaces the offer page
   with the checkout on the same URL.
4. Wallet step: pick "External wallet" (QA Wallet).
5. Amount step: enter an amount, "Confirm amount". The approval runs here.
6. Review step: the quote with its countdown, then "Place order". A Sepolia
   quote lives about 15 seconds, so frame and click within that.
7. The confirmation dialog shows the placed order. A Sepolia buy spends
   about 10-20 seconds on "Placing your order...".

Recording the review step at 1280x720: the quote line sits just above
"Place order" but below the fold. Scroll so both are in view before the click
(centre on them: `window.scrollY` about 250), or the video shows the CTA
change and never the line it hides.

## Quirks

- Ondo refuses quotes while the asset is not tradable: market closed or
  paused, including a brief pause at every US session change (04:00 and 16:00
  ET). That surfaces as a not-tradable state, not a failure; rerun in market
  hours.
- A Sepolia sell can revert on-chain ("Could not place your order") for
  reasons outside the change under test. If a sell reverts, retry once, then
  mark the sell Unverified with that repro.

## Out of scope

- Mainnet and real funds: the demo runs on Sepolia only.
- KYC, allowlisting and account setup on CoinList: preconditions the user
  owns.
