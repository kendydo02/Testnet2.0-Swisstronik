const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/utils");

const sendShieldedQuery = async (provider, destination, data) => {
  const rpcLink = hre.network.config.url;

  const [encryptedData, usedEncryptionKey] = await encryptDataField(rpcLink, data);

  const response = await provider.call({
    to: destination,
    data: encryptedData,
  });

  return await decryptNodeResponse(rpcLink, response, usedEncryptionKey);
};

async function main() {
  const contractAddress = "0x3fCE3CC2560D2caA1e0EA04B3EB57CeA5105e9be";

  const [signer] = await hre.ethers.getSigners();

  const contractFactory = await hre.ethers.getContractFactory("Swisstronik"); 
  const contract = contractFactory.attach(contractAddress);

  const functionName = "balanceOf";
  const functionArgs = ["0x9f9503F1401Fd34733151368366849053eAEdf78"]; 
  const responseMessage = await sendShieldedQuery(signer.provider, contractAddress, contract.interface.encodeFunctionData(functionName, functionArgs));

  console.log("Decoded response:", contract.interface.decodeFunctionResult(functionName, responseMessage)[0].toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});