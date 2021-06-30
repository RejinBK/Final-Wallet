const but = document.getElementById('genkeys')
const pub_keys = document.getElementById('pub_keys')


console.log('jahfdkjahfkj')

but.addEventListener("click", ()=>{
	fetch("/public-key")
.then(now=>now.json())
.then(res=>{
	pub_keys.innerText = res.publicKey

//console.log(response.publicKey, response.privateKey)

})
.catch(err=>console.error(err))
})