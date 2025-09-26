one time doc share 

first there wiull be 2 functions - admin, view

admin -
1. in admin the user will fisr connect the wallet and will upload the doc which will move to backend and user will also mention the wallet addresses that will have the access to the link.

2. then the doc and the addresses will move to the backend the backend will pass this to seal sdk it will encryot the doc and generate a public and private key for decrypting it later and will store it in the memory only 

3. then the encrypted file will move to walrus, walrus sdk(tusky), (seal) will conver that encrypted file to a link that can be shared.

view - 
1. in view the user will first connect the wallet then will paste the link in the input box and if the wallet address of the user is same as the one the admin mentioned then the file will open otherwise it will not open and if all the mentioned users opened the file the the file will get erased from walrus storage or if all users didnt open the file the data will anyway get erased within a specific timeline 2mins

