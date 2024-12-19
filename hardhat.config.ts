import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

// Reemplaza esta clave privada por la clave privada de tu cuenta Sepolia
// Para exportar tu clave privada desde Metamask, abre Metamask y
// ve a Detalles de la Cuenta > Exportar Clave Privada
// Advertencia: NUNCA coloques Ether real en cuentas de prueba
// const SEPOLIA_PRIVATE_KEY = "";

const config: HardhatUserConfig = {
  solidity: "0.8.22",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.NETWORK_API_KEY}`,
      accounts: process.env.SEPOLIA_PRIVATE_KEY
        ? [process.env.SEPOLIA_PRIVATE_KEY]
        : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
