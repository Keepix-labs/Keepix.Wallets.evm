import { ethers } from "ethers";
export declare const Token: {
    getTokenContract: (connectedWallet: ethers.Wallet, tokenAddress: string) => ethers.Contract;
    getTokenBalanceOf: (connectedWallet: ethers.Wallet, tokenAddress: string, ofBalance: string) => Promise<any>;
    getTokenBalanceOfAndFormatToUnit: (connectedWallet: ethers.Wallet, tokenAddress: string, ofBalance: string, units?: number | undefined) => Promise<string>;
};
