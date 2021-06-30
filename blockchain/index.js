const Block = require('./block');
const fs = require('fs');
const glob = require('glob');

class Blockchain{
    constructor(){
        this.chain = [Block.genesis()];
    }
    /**
     * utility function to add block to the blockchain
     * returns the added block
     */

    addBlock(data){
        const block = Block.mineBlock(this.chain[this.chain.length-1],data);
        this.chain.push(block);
        const TOTALblockjson = JSON.stringify(this.chain);
        fs.writeFile("./CHAIN/BLOCKS/BLOCKS.json", TOTALblockjson, 'utf8' , (err , file) =>console.log('updated successsfully to file.'));
        
        return block;
    }

    /**
     * checks if the chain recieved from another miner is valid or not
     */

    isValidChain(chain){
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
            return false;

        for(let i = 1 ; i<chain.length; i++){
            const block = chain[i];
            const lastBlock = chain[i-1];
            if((block.lastHash !== lastBlock.hash) || (
                block.hash !== Block.blockHash(block)))
            return false;
        }

        return true;

    }
    /**
     * replace the chain if the chain recieved from another miner
     * is longer and valid
     */

    replaceChain(newChain){
        if(newChain.length <= this.chain.length){
            console.log("!!SAME SIZE CHAIN RECEIVED!! (no changes done)");
            return;
        }else if(!this.isValidChain(newChain)){
            console.log("Recieved chain is invalid");
            return;
        }
        
        console.log("!!<CHAIN REPLACED WITH NEW AND LONGER CHAIN>!!");
        this.chain = newChain; 
        const TOTALblockjson = JSON.stringify(this.chain);
        fs.writeFile("./CHAIN/BLOCKS/BLOCKS.json", TOTALblockjson, 'utf8' , (err , file) =>console.log('updated successsfully to file.'));

    }
}

module.exports = Blockchain;