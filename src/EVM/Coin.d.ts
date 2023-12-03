import { Wallet } from "./Wallet";
export declare const Coin: {
    getBalanceOf: (wallet: Wallet, address: string) => Promise<unknown>;
};
