import { CHAIN_ORIGIN, HISTORY_ORIGIN, currencyBalance, historyActions } from "./api";
import { POLICIES, snapshot } from "./il";
import type { ChainAction, HttpRequest } from "./api";

export type UseCase = {
  title: string;
  detail: string;
  request: HttpRequest;
  transaction: { note: string; actions: ChainAction[] } | null;
};

const cover = snapshot({ entryValueQuote: 100, entryPrice: 1, priceNow: 4, policy: POLICIES.deductible });

export const USE_CASES: UseCase[] = [
  {
    title: "A token balance is not a pool index",
    detail: "get_currency_balance reads one symbol. It is not an Alcor tick and not this insurance policy. Prices in the snapshot are arguments.",
    request: currencyBalance(CHAIN_ORIGIN, "alice"),
    transaction: null,
  },
  {
    title: "Swap-shaped history you would still not treat as a price",
    detail: `At a 4x price, deductible cover payout is ${cover.payoutQuote}. No premium transfer is constructed. Not financial advice.`,
    request: historyActions(HISTORY_ORIGIN, "alice", "eosio.token:transfer", 20),
    transaction: null,
  },
];

export function assertUseCases(): void {
  if (!(cover.payoutQuote > 0) || !(cover.ilQuote < 0)) throw new Error("expected loss and a payout");
}
