import { ethers } from "ethers";
export declare class Wallet {
    private wallet;
    private mnemonic?;
    private type;
    private keepixTokens?;
    private rpc?;
    constructor({ password, mnemonic, privateKey, type, keepixTokens, rpc, privateKeyTemplate }: {
        password?: string;
        mnemonic?: string;
        privateKey?: string;
        type: string;
        keepixTokens?: {
            coins: any;
            tokens: any;
        };
        rpc?: any;
        privateKeyTemplate?: string;
    });
    getPrivateKey(): string;
    getMnemonic(): string;
    getAddress(): string;
    getProdiver(): Promise<ethers.providers.JsonRpcProvider>;
    getConnectedWallet: () => Promise<ethers.Wallet>;
    getBalance(): Promise<unknown>;
    getBalanceOfToken(tokenAddress: string): Promise<string>;
    estimateCostOfTx(tx: any): Promise<{
        success: boolean;
        description: string;
    }>;
    estimateCostSendCoinTo(receiverAddress: string, amountInEther: string): Promise<{
        success: boolean;
        description: string;
    }>;
    sendCoinTo(receiverAddress: string, amountInEther: string): Promise<{
        success: boolean;
        description: string;
    }>;
    sendTokenTo(tokenAddress: string, receiverAddress: string, amountInEther: string): Promise<{
        success: boolean;
        description: string;
    }>;
    estimateCostSendTokenTo(tokenAddress: string, receiverAddress: string, amountInEther: string): Promise<{
        success: boolean;
        description: string;
    }>;
}
