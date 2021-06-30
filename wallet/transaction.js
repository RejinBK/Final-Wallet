const ChainUtil = require('../chain-util');
const {MINING_REWARD} = require('../config');
const fs = require('fs');
class Transaction{
    constructor(){
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];

    }

    /**
     * add extra ouputs to the transactions
     */

    update(senderWallet,recipient,amount){

        const senderOutput = this.outputs.find(output => output.address == senderWallet.publicKey);

        if(amount > senderWallet.amount){
            console.log(`Amount ${amount} exceeds balance`);
            return;
        }

        senderOutput.amount = senderOutput.amount - amount;
        this.outputs.push({amount: amount,address: recipient});
        Transaction.signTransaction(this,senderWallet);

        return this;
    }
    /**
     * create a new transaction
     */

    static newTransaction(senderWallet,recipient,amount){

        if(amount > senderWallet.calculateBalance){
            console.log(`Amount : ${amount} exceeds the balance`);
            return;
        }
        // call to the helper function that creates and signs the transaction outputs
        return Transaction.transactionWithOutputs(senderWallet,[
            {amount: senderWallet.balance - amount , address: senderWallet.publicKey },
            {amount: amount , address: recipient}
        ])
    }

    /**
     * helper function
     */

    static transactionWithOutputs(senderWallet,Outputs){
        const transaction = new this();
        transaction.outputs.push(...Outputs);
        Transaction.signTransaction(transaction,senderWallet);
        return transaction;
    }

    /**
     * create input and sign the outputs
     */

    static signTransaction(transaction,senderWallet){
        //this.publicKey = fs.readFileSync('./keys/public.pem', 'utf8', (err, file) => {if (err) throw err;});
        transaction.input = 
        {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.address,
            signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
        }
    }

    /**
     * verify the transaction by decrypting and matching
     */

    static verifyTransaction(transaction)
    {
    return ChainUtil.verifySignature(transaction.input.address,transaction.input.signature,
        ChainUtil.hash(transaction.outputs)
        )
    }

    static rewardTransaction(publicKey,blockchainWallet){
        return Transaction.transactionWithOutputs(blockchainWallet,[{
            amount: MINING_REWARD,
            address: publicKey
        }]);
    }
}

module.exports = Transaction;