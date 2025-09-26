<button id="connect-wallet">Connect MetaMask</button>
<div id="wallet-address"></div>

<script>
  const button = document.getElementById('connect-wallet');
  const addressDiv = document.getElementById('wallet-address');

  button.onclick = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];
        addressDiv.innerText = 'Connected wallet: ' + userAddress;
      } catch (error) {
        alert('User denied wallet connection');
      }
    } else {
      alert('MetaMask is not installed.');
    }
  };
</script>
