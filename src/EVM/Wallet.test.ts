import { Wallet } from './Wallet';

describe('basic wallet', () => {
    const mnemonic = 'celery net original hire stand seminar cricket reject draft hundred hybrid dry three chair sea enable perfect this good race tooth junior beyond since';
    const privateKey = '0xae9bac10dce0a23d6b58b12ff0351b783ae01a17d0c9843da6681cb4761c5ef7';
    const address = '0x635cb45Dd6Ec03fee2570BA35Af38d54Ef54e7Ae';

  it('can generate same wallet', async () => {
    const wallet = new Wallet({ password: 'toto', type: 'ethereum' });
    expect(wallet.getAddress()).toEqual(address);
    expect(wallet.getPrivateKey()).toEqual(privateKey);
    expect(wallet.getMnemonic()).toEqual(mnemonic);
  });

  it('can generate with Mnemonic', async () => {
    const wallet = new Wallet({ mnemonic: mnemonic, type: 'ethereum' });

    expect(wallet.getAddress()).toEqual(address);
    expect(wallet.getPrivateKey()).toEqual(privateKey);
    expect(wallet.getMnemonic()).toEqual(mnemonic);
  });

  it('can generate with PrivateKey', async () => {
    const wallet = new Wallet({ privateKey: privateKey, type: 'ethereum' });

    expect(wallet.getAddress()).toEqual(address);
    expect(wallet.getPrivateKey()).toEqual(privateKey);
    expect(wallet.getMnemonic()).toBe(undefined);
  });

  it('can generate with random', async () => {
    const wallet = new Wallet({ type: 'ethereum' });

    expect(wallet.getAddress()).toBeDefined();
    expect(wallet.getPrivateKey()).toBeDefined();
    expect(wallet.getMnemonic()).toBeDefined();
  });

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

  it('can getBalance', async () => {
    const wallet = new Wallet({ password: 'toto', type: 'ethereum', keepixTokens });
    expect(await wallet.getBalance()).toEqual('0.0');
  });

  it('can getTokenBalance', async () => {
    const wallet = new Wallet({ password: 'toto', type: 'ethereum', keepixTokens });
    expect(await wallet.getBalanceOfToken("0xd33526068d116ce69f19a9ee46f0bd304f21a51f")).toEqual('0.0');
  });

  it('can estimate sendCoin', async () => {
    const wallet = new Wallet({ password: 'toto', type: 'ethereum', keepixTokens });
    const estimationResult = await wallet.estimateCostSendCoinTo("0xd33526068d116ce69f19a9ee46f0bd304f21a51f", '0.1');
    expect(estimationResult.success).toBe(false);
    expect(estimationResult.description).toMatch('insufficient funds');
  });

  it('can estimate sendToken', async () => {
    const wallet = new Wallet({ password: 'toto', type: 'ethereum', keepixTokens });
    const estimationResult = await wallet.estimateCostSendTokenTo("0xd33526068d116ce69f19a9ee46f0bd304f21a51f", "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11", '0.1');
    expect(estimationResult.success).toBe(false);
    expect(estimationResult.description).toMatch('execution reverted: ERC20: transfer amount exceeds balance');
  });
})