import hre from "hardhat";
import { ethers } from "hardhat";

async function main() {
  // Desplegar DAppToken
  const [deployer] = await ethers.getSigners();
  console.log("Deploying DAppToken...");
  console.log(`owner address: ${deployer.address}`);

  const DAppToken = await ethers.getContractFactory("DAppToken");
  const dappToken = await DAppToken.deploy(deployer.address);
  await dappToken.waitForDeployment();
  console.log("DAppToken deployed to:", dappToken.target);

  // Desplegar LPToken
  console.log("Deploying LPToken...");
  const LPToken = await ethers.getContractFactory("LPToken");
  const lpToken = await LPToken.deploy(deployer.address);
  await lpToken.waitForDeployment();
  console.log("LPToken deployed to:", lpToken.target);

  // const DAPP_TOKEN_ADDRESS = "0xYourDAppTokenAddress";
  // const LP_TOKEN_ADDRESS = "0xYourLPTokenAddress";
  // Desplegar TokenFarm
  console.log("Deploying TokenFarm...");
  const TokenFarm = await ethers.getContractFactory("TokenFarm");
  const tokenFarm = await TokenFarm.deploy(dappToken.target, lpToken.target);
  await tokenFarm.waitForDeployment();
  console.log("TokenFarm deployed to:", tokenFarm.target);

  console.log("Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });
