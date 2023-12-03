import { ethers } from "ethers";
import { Wallet } from "./Wallet";

const getBalanceOf = async (wallet: Wallet, address: string) => {
    const provider = await wallet.getProdiver();
    return new Promise((resolve) => {
        provider?.getBalance(address).then((balance) => {
            const balanceInEth = ethers.utils.formatEther(balance);
            resolve(balanceInEth);
        }).catch(() => resolve('0'));
    });
}

export const Coin = {
    getBalanceOf
};