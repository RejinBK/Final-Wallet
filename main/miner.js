const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet/index');

class Miner{
    constructor(blockchain,transactionPool,wallet,p2pServer){
        this.blockchain = blockchain;
        this.p2pServer = p2pServer;
        this.wallet = wallet;
        this.transactionPool = transactionPool;
    }

    mine(){
        
         // grab transaction from the pool that are valid
         // create a block using the transactions
         // synchronize the chain and include new block
         // clear the transaction pool to remove confirmed transactions

         const validTransactions = this.transactionPool.validTransactions();

         // include reward for the miner in the valid transactions array

         validTransactions.push(Transaction.rewardTransaction(this.wallet.address,Wallet.blockchainWallet()));

         // create a block consisting of the valid transaction

         const block = this.blockchain.addBlock(validTransactions);

         // synchronize the chains in the p2p server

         this.p2pServer.syncChain();

         // clear the transaction pool

         this.transactionPool.clear();

         // broadcast every miner to clear their pool

         this.p2pServer.broadcastClearTransactions();

         return block;


    }
}

module.exports = Miner;