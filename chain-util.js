const uuidV1 = require('uuidv1');
const crypto = require('crypto');
const SHA256 = require('crypto-js/sha256');
const fs = require('fs');


class ChainUtil{

    static id(){
        return uuidV1();
    }

    static hash(data){
        return SHA256(JSON.stringify(data)).toString();
    }
    /**
     * verify the transaction signature to 
     * check its validity using the method provided
     * in EC module
     */

    static verifySignature(publicKey,signature,dataHash)
    {

        const verify = crypto.createVerify('SHA256');
        verify.write(dataHash);
        verify.end();
        const verified = verify.verify(publicKey, signature, 'hex')
        console.log(verified);
        return verified;
    }

}
module.exports = ChainUtil;