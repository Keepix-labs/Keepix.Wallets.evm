import { Coin } from './Coin';
import { Wallet } from './Wallet';

describe('Coin test', () => {
  
    const keepixTokens: any = {
        coins: {
            "ethereum": {
                "nativeCoinName": "ETH",
                "name": "Ethereum",
                "type": "evm",
                "icon": "./icons/ETH.png",
                "rpcs": [
                    {
                        "url": "https://mainnet.infura.io/v3/00e69497300347a38e75c3287621cb16",
                        "chainId": 1
                    }
                ],
                "getPriceByPoolBalance": {
                    "tokenA": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                    "tokenB": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
                    "tokenADecimals": 18,
                    "tokenBDecimals": 18,
                    "poolAddress": "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11",
                    "blockchain": "ethereum"
                }
            }
        }
    };

    it('can get Specific Wallet Balance', async () => {
        const wallet = new Wallet({ type: 'ethereum', keepixTokens });
        const targetAddress = '0x635cb45Dd6Ec03fee2570BA35Af38d54Ef54e7Ae';
        expect(await Coin.getBalanceOf(wallet, targetAddress)).toEqual('0.0');
    });
})