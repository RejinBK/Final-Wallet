const express = require('express');
const Blockchain = require('../blockchain');
const bodyParser = require('body-parser');
const P2pserver = require('./p2p-server');
const Miner = require('./miner');
const path = require('path')
const ngrok = require('ngrok');
require("dotenv").config();
const downloadNgrok = require('ngrok/download');


const HTTP_PORT = process.env.HTTP_PORT || 3001;

const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const P2P_PORT = process.env.P2P_PORT;
const TOKEN = process.env.TOKEN;

const app  = express();

//using the blody parser middleware
//app.use(bodyParser.json());


//copied from frontend
app.use(express.json())
const staticDir = path.join(__dirname, "../public")
app.use(express.static(staticDir))

app.get("/generate", (req,res)=>{
	res.sendFile(staticDir+"/generate.html")
})


// create a new blockchain instance
const blockchain = new Blockchain();

// create a new wallet
const wallet = new Wallet();

// create a new transaction pool
const transactionPool = new TransactionPool();

// create a p2p server instance with the blockchain and the transaction pool
const p2pserver = new P2pserver(blockchain,transactionPool);

// create a miner
const miner = new Miner(blockchain,transactionPool,wallet,p2pserver);




app.get('/blocks',(req,res)=>{

    res.json(blockchain.chain);

});


app.post('/mine',(req,res)=>{
    const block = blockchain.addBlock(req.body.data);
    console.log(`New block added: ${block.toString()}`);
    
    p2pserver.syncChain();
    res.redirect('/blocks');
});

//  start mining
app.get('/mine-transactions',(req,res)=>{
    const block = miner.mine();
    console.log(`New block added: ${block.toString()}`);
    res.redirect('/blocks');
})

// view transaction in the transaction pool
app.get('/transactions',(req,res)=>{
    res.json(transactionPool.transactions);
});


//view wallet balance
app.get('/balance',(req,res)=>{
  //  res.json({publicKey: wallet.publicKey});
    res.json({Balance : wallet.calculateBalance(blockchain)});
});



// create transactions
app.post('/transact',(req,res)=>{
    const { recipient, amount } = req.body;
    const transaction = wallet.createTransaction(recipient, amount,blockchain,transactionPool);
    p2pserver.broadcastTransaction(transaction);
    res.redirect('/transactions');
});

// get public key
app.get('/public-key',(req,res)=>{
    //return res.json(wallet.publickey);
    //console.log(req);
    res.json( { publicKey : wallet.publicKey });
})




app.listen(HTTP_PORT,()=>{
    console.log(`listening on port ${HTTP_PORT}`);
})

// p2p server 
p2pserver.listen();





  // ngrok.connect({
  //   proto: "tcp",
  //   addr: P2P_PORT,
  //   authtoken : TOKEN ,
  //   region : "in"

  // })
  // .then(url => {
  //   console.log(`ngrok tunnel opened at: ${url}`);

  // })
  // .catch((error) => {
  //   console.error("Error opening ngrok tunnel: ", error);
  //   process.exitCode = 1;
  // })