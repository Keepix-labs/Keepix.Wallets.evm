import { ethers } from "ethers";

const getTokenContract = (connectedWallet: ethers.Wallet, tokenAddress: string) => {
    const contratToken = new ethers.Contract(
        tokenAddress,// 2040
        [
            { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } as any ], "stateMutability": "view", "type": "function", "constant": true },
            { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } as any  ], "stateMutability": "view", "type": "function", "constant": true },
            { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } as any  ], "stateMutability": "view", "type": "function", "constant": true },
            { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } as any  ], "stateMutability": "view", "type": "function", "constant": true },
            { "inputs": [{"name": "_owner","type": "address"}],"name": "balanceOf","outputs": [{"name": "balance","type": "uint256"}], "stateMutability": "view", "type": "function", "constant": true},
            { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }
        ],
        connectedWallet
    );
    return contratToken;
}

const getTokenBalanceOf = async (connectedWallet: ethers.Wallet, tokenAddress: string, ofBalance: string) => {
    try {
        return await getTokenContract(connectedWallet, tokenAddress).balanceOf(ofBalance);
    } catch (e) { }
    return '0';
}

const getTokenBalanceOfAndFormatToUnit = async (connectedWallet: ethers.Wallet, tokenAddress: string, ofBalance: string, units: number | undefined = undefined) => {
    try {
        const balanceOUT = await getTokenBalanceOf(
            connectedWallet,
            tokenAddress,
            ofBalance
        );
        const unitsOfTheToken = units ?? await getTokenContract(connectedWallet, tokenAddress).decimals();
        return ethers.utils.formatUnits(balanceOUT, unitsOfTheToken);
    } catch (e) { }
    return '0';
}

export const Token = {
    getTokenContract,
    getTokenBalanceOf,
    getTokenBalanceOfAndFormatToUnit
};