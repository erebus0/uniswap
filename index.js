const {ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent} = require('@uniswap/sdk');
const ethers = require('ethers')
const chainId = ChainId.MAINNET;
const tokenAddress ='0x6B175474E89094C44Da98b954EedeAC495271d0F';

const init = async () => {
    const dai = await Fetcher.fetchTokenData(chainId, tokenAddress);
    const weth = WETH[chainId];
    const pair = await Fetcher.fetchPairData(dai, weth);
    const route = new Route([pair],weth);
    const trade = new Trade(route, new TokenAmount(weth, '100000000000000000'),TradeType.EXACT_INPUT);
    console.log(route.midPrice.toSignificant(6));
    console.log(route.midPrice.invert().toSignificant(6));
    console.log(trade.executionPrice.toSignificant(6));
    console.log(trade.nextMidPrice.toSignificant(6));

    const slippageTolerance = new Percent('50','10000');
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
    const path = [weth.address, dai.address];
    const to = '';
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const value = trade.inputAmount.raw;

    const provider = ethers.getDefaultProvider('mainnet',{
        infura: 'https://mainnet.infura.io/v3/a1329a8cd7a34b29b83290023636432c'
    });

    const signer = new ethers.Wallet('52b411a1f93e232cb2c1d974f805f8af38d43e5d548b3ab029926a0ebedaceff');
    const account = signer.connect(provider);
    const uniswap = new ethers.Contract(
        '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        ['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'],
         account 
    ); 
    const tx = await uniswap.sendExactETHForTokens(
        amountOutMin,
        path,
        to,
        deadline,
        {value, gasPrice: 20e9}
    );
    
    console.log('Transaction hash:${tx.hash}');
    const receipt = await tx.wait();
    console.log('Transaction was mined in block ${receipt.blockNumber}');





}

init();



