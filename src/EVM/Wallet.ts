import { entropyToMnemonic } from "@ethersproject/hdnode";
import { ethers } from "ethers";
import { Token } from "./Token";
import { sha256 } from 'js-sha256';

function createPrivateKey(templatePrivateKey: string, password: string): string {
    // Concaténation de la clé privée et du mot de passe
    const combined = templatePrivateKey + password;

    // Retourne le hash SHA-256 en hexadécimal
    return sha256(combined);
}

/**
 * Wallet class who respect the WalletLibraryInterface for Keepix
 */
export class Wallet {

    private wallet: ethers.Wallet;
    private mnemonic?: string;
    private type: string;
    private keepixTokens?: { coins: any, tokens: any };
    private rpc?: any;
    
    constructor({
        password,
        mnemonic,
        privateKey,
        type,
        keepixTokens,
        rpc,
        privateKeyTemplate = '0x2050939757b6d498bb0407e001f0cb6db05c991b3c6f7d8e362f9d27c70128b9'
    }: {
        password?: string,
        mnemonic?: string,
        privateKey?: string,
        type: string,
        keepixTokens?: { coins: any, tokens: any } // whitelisted coins & tokens
        rpc?: any,
        privateKeyTemplate?: string
    }) {
        this.type = type;
        this.keepixTokens = keepixTokens;
        this.rpc = rpc;
        // from password
        if (password !== undefined) {
            const newPrivateKeyETH = createPrivateKey(privateKeyTemplate, password);
            this.mnemonic = entropyToMnemonic(Buffer.from(newPrivateKeyETH, 'hex'));
            this.wallet = ethers.Wallet.fromMnemonic(this.mnemonic);
            return ;
        }
        // from mnemonic
        if (mnemonic !== undefined) {
            this.mnemonic = mnemonic;
            this.wallet = ethers.Wallet.fromMnemonic(mnemonic);
            return ;
        }
        // from privateKey only
        if (privateKey !== undefined) {
            this.mnemonic = undefined;
            this.wallet = new ethers.Wallet(privateKey);
            return ;
        }
        // Random
        this.mnemonic = entropyToMnemonic(ethers.utils.randomBytes(32));
        this.wallet = ethers.Wallet.fromMnemonic(this.mnemonic);
    }

    // PUBLIC

    public getPrivateKey() {
        return this.wallet.privateKey;
    }

    public getMnemonic() {
        return this.mnemonic;
    }

    public getAddress() {
        return this.wallet.address;
    }

    public async getProdiver() {
        let overridedRpc: any = undefined;

        if (this.rpc !== undefined && typeof this.rpc === 'object') {
            overridedRpc = this.rpc;
        }

        const coins = this.keepixTokens?.coins;
        if (coins === undefined) {
            throw Error(`EVM.Wallet Object coins in the keepix-tokens library not found.`);
        }
        const coinInformation = coins[this.type];
        if (coinInformation === undefined) {
            throw Error(`EVM.Wallet Coin Type (${this.type}) not found in the keepix-tokens list.`);
        }
        if (coins[this.type].rpcs === undefined || !Array.isArray(coins[this.type].rpcs)) {
            return undefined;
        }
        if (coins[this.type].rpcs.length === 0) {
            return undefined;
        }

        let rpc = coins[this.type].rpcs[Math.floor(Math.random()*coins[this.type].rpcs.length)];

        if (overridedRpc !== undefined
            && overridedRpc.chainId !== undefined
            && overridedRpc.url !== undefined && overridedRpc.url !== '') {
            rpc = overridedRpc;
        }
        const provider = new ethers.providers.JsonRpcProvider(rpc as any);
        return provider;
    }

    public getConnectedWallet = async () => {
        const provider = await this.getProdiver();

        if (provider === undefined) {
            throw Error('EVM.Wallet Undefined Provider');
        }
        return this.wallet.connect(provider);
    }

    // always display the balance in 0 decimals like 1.01 ETH
    public async getCoinBalance(walletAddress?: string) {
        const provider = await this.getProdiver();
        return new Promise((resolve) => {
            provider?.getBalance(walletAddress ?? this.wallet.address).then((balance) => {
                const balanceInEth = ethers.utils.formatEther(balance);
                resolve(balanceInEth);
            }).catch(() => {
                resolve('0');
            });
        });
    }

    // always display the balance in 0 decimals like 1.01 RPL
    public async getTokenBalance(tokenAddress: string, walletAddress?: string) {
        const connectedWallet = await this.getConnectedWallet();
        return await Token.getTokenBalanceOfAndFormatToUnit(connectedWallet, tokenAddress, walletAddress ?? this.wallet.address);
    }

    public async estimateCostOfTx(tx: any) {
        const connectedWallet = await this.getConnectedWallet();
        const estimationRequest: any = await new Promise((resolve) => {
            connectedWallet.estimateGas(tx).then((estimation) => {
                const estimationInEth = ethers.utils.formatEther(estimation);
                resolve({ result: estimationInEth });
            }).catch((e) => {
                resolve({ error: e.message });
            });
        });

        if (estimationRequest.result !== undefined) { // success
            return { success: true, description: `${estimationRequest.result}` };
        } else {
            return { success: false, description: `Getting estimation failed: ${estimationRequest.error}` };
        }
    }

    public async estimateCostSendCoinTo(receiverAddress: string, amount: string) {
        const tx = {
            to: receiverAddress,
            // Convert currency unit from ether to wei
            value: ethers.utils.parseEther(amount)
        };
        return this.estimateCostOfTx(tx);
    }

    public async sendCoinTo(receiverAddress: string, amount: string) {
        const connectedWallet = await this.getConnectedWallet();

        const tx = {
            to: receiverAddress,
            // Convert currency unit from ether to wei
            value: ethers.utils.parseEther(amount)
        };

        const transactionRequest: { tx?: ethers.providers.TransactionResponse, error?: string } =
            await new Promise((resolve) => {
                connectedWallet.sendTransaction(tx).then((txObj: ethers.providers.TransactionResponse) => {
                    console.log('txHash', txObj.hash)
                    resolve({ tx: txObj });
                }).catch((e: any) => {
                    resolve({ tx: undefined, error: e.message });
                });
            });

        if (transactionRequest.tx !== undefined) {
            const transactionReceipt = await transactionRequest.tx.wait(1); // await one confirmation.

            if (transactionReceipt.status == 1) { // success
                return { success: true, description: `${transactionRequest.tx.hash}` };
            } else {
                return { success: false, description: `Transaction failed: ${transactionRequest.tx.hash}` };
            }
        }
        return { success: false, description: transactionRequest.error };
    }

    public async sendTokenTo(tokenAddress: string, receiverAddress: string, amount: string) {
        const connectedWallet = await this.getConnectedWallet();
        const contract = Token.getTokenContract(connectedWallet, tokenAddress);

        const decimals = await contract.decimals();
        const transactionRequest: { tx?: ethers.providers.TransactionResponse, error?: string } =
            await new Promise((resolve) => {
                contract.transfer(receiverAddress, ethers.utils.parseUnits(amount, decimals)).then((txObj: ethers.providers.TransactionResponse) => {
                    console.log('txHash', txObj.hash)
                    resolve({ tx: txObj });
                }).catch((e: any) => {
                    resolve({ tx: undefined, error: e.message });
                });
            });
        
        if (transactionRequest.tx !== undefined) {
            const transactionReceipt = await transactionRequest.tx.wait(1); // await one confirmation.

            if (transactionReceipt.status == 1) { // success
                return { success: true, description: `${transactionRequest.tx.hash}` };
            } else {
                return { success: false, description: `Transaction failed: ${transactionRequest.tx.hash}` };
            }
        }
        return { success: false, description: transactionRequest.error };
    }

    public async estimateCostSendTokenTo(tokenAddress: string, receiverAddress: string, amount: string) {
        const connectedWallet = await this.getConnectedWallet();
        const contract = Token.getTokenContract(connectedWallet, tokenAddress);

        const decimals = await contract.decimals();
        const estimationRequest: { result?: any, error?: string } = await new Promise((resolve) => {
            contract.estimateGas.transfer(receiverAddress, ethers.utils.parseUnits(amount, decimals)).then((estimation: any) => {
                const estimationInEth = ethers.utils.formatEther(estimation);
                resolve({ result: estimationInEth });
            }).catch((e: any) => {
                resolve({ error: e.message });
            });
        });

        if (estimationRequest.result !== undefined) { // success
            return { success: true, description: `${estimationRequest.result}` };
        } else {
            return { success: false, description: `Getting estimation failed: ${estimationRequest.error}` };
        }
    }
}