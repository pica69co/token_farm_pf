import { ethers } from "ethers";
import dotenv from "dotenv";
import tokenFarmABI from "../artifacts/contracts/TokenFarm.sol/TokenFarm.json";
import lpTokenABI from "../artifacts/contracts/LPToken.sol/LPToken.json";
import dappTokenABI from "../artifacts/contracts/DappToken.sol/DAppToken.json";

dotenv.config();

// Environment variables
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || "";

// Contract addresses (actual addresses must be added after deployment)
const TOKEN_FARM_ADDRESS = "0xYourTokenFarmAddress";
const LP_TOKEN_ADDRESS = "0xYourLPTokenAddress";
const DAPP_TOKEN_ADDRESS = "0xYourDAppTokenAddress";

// Connect to Ethereum provider
const provider = new ethers.JsonRpcProvider(
  `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
);

// Load wallet from private key
const wallet = new ethers.Wallet(SEPOLIA_PRIVATE_KEY, provider);

// Create contract instances
const tokenFarmContract = new ethers.Contract(
  TOKEN_FARM_ADDRESS,
  tokenFarmABI.abi,
  wallet
);

const lpTokenContract = new ethers.Contract(
  LP_TOKEN_ADDRESS,
  lpTokenABI.abi,
  wallet
);

const dappTokenContract = new ethers.Contract(
  DAPP_TOKEN_ADDRESS,
  dappTokenABI.abi,
  wallet
);

async function main() {
  try {
    // 1. Aprobar tokens LP para el contrato TokenFarm
    console.log("Aprobando tokens LP...");
    const amountToApprove = ethers.parseEther("50");
    const approveTx = await lpTokenContract.approve(
      TOKEN_FARM_ADDRESS,
      amountToApprove
    );
    await approveTx.wait();
    console.log(`Tokens LP aprobados: ${ethers.formatEther(amountToApprove)}`);

    // 2. Depositar tokens LP en TokenFarm
    console.log("Depositando tokens LP en TokenFarm...");
    const depositTx = await tokenFarmContract.deposit(amountToApprove);
    await depositTx.wait();
    console.log(`Tokens LP depositados exitosamente.`);

    // 3. Consultar balance de staking del usuario
    console.log("Consultando balance de staking...");
    const stakerInfo = await tokenFarmContract.stakerInfo(wallet.address);
    console.log(
      `Balance de staking: ${ethers.formatEther(stakerInfo.balance)} LP Tokens`
    );

    // 4. Reclamar recompensas
    console.log("Reclamando recompensas acumuladas...");
    const claimTx = await tokenFarmContract.claimRewards();
    await claimTx.wait();
    console.log("Recompensas reclamadas exitosamente.");

    // 5. Retirar tokens LP
    console.log("Retirando tokens LP...");
    const withdrawTx = await tokenFarmContract.withdraw();
    await withdrawTx.wait();
    console.log("Tokens LP retirados exitosamente con la tarifa aplicada.");

    // 6. Consultar balance de DApp tokens (recompensas)
    console.log("Consultando balance de recompensas en DAppToken...");
    const dappTokenBalance = await dappTokenContract.balanceOf(wallet.address);
    console.log(
      `Balance de DApp Tokens: ${ethers.formatEther(dappTokenBalance)} DAPP`
    );
  } catch (error) {
    console.error("Error durante la interacción con el contrato:", error);
  }
}

main();
