# Ejercicio Simple DeFi Yield Farming

### Proyecto:

En este ejercicio, implementarás un proyecto DeFi simple de Token Farm.

La Farm debe permitir a los usuarios realizar depósitos y retiros de un token mock LP.  
Los usuarios también pueden reclamar las recompensas generadas durante el staking. Estas recompensas son tokens de la plataforma.

El caso de uso del contrato Simple Token Farm es el siguiente:

- Los usuarios depositan tokens LP con la función `deposit()`.
- Los usuarios pueden recolectar o reclamar recompensas con la función `claimRewards()`.
- Los usuarios pueden deshacer el staking de todos sus tokens LP con la función `withdraw()`, pero aún pueden reclamar las recompensas pendientes.
- Cada vez que se actualiza la cantidad de tokens LP en staking, las recompensas deben recalcularse primero.
- El propietario de la plataforma puede llamar al método `distributeRewardsAll()` a intervalos regulares para actualizar las recompensas pendientes de todos los usuarios en staking.

---

### Contratos

- `LPToken.sol`: Contrato del token LP, utilizado para el staking.
- `DappToken.sol`: Contrato del token de la plataforma, utilizado como recompensa.
- `TokenFarm.sol`: Contrato de la Farm.

---

## Project Structure

```bash
/root-project-directory
├── README.md                         # Project overview and instructions.
├── contracts                         # Folder containing all the Solidity smart contracts.
│   ├── DappToken.sol                 # ERC20 contract for DappToken.
│   ├── LPToken.sol                   # ERC20 contract for LPToken.
│   └── TokenFarm.sol                 # Main smart contract for the Yield Farming mechanism.
├── ignition
│   ├── modules
├── scripts                           # Folder containing Hardhat scripts for deployment and management.
├── test                              # Folder containing test files for the smart contracts.
├── hardhat.config.ts                 # Hardhat configuration file for the project.
├── package-lock.json                 # Dependency file for the overall project.
├── package.json                      # Project's metadata and dependencies for the overall environment.
```

## Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (v14 or later)
- Hardhat

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/pica69co/token_farm_pf.git
```

### 2. Install Dependencies

Install all necessary dependencies for both the backend (smart contracts) and the frontend.

```bash
npm install         # Install dependencies for the hardhat project
```

### 3. Configure Environment Variables

Create a `.env` file at the root of your project and include the following:

```bash
# .env
NETWORK_API_KEY=your-network-api-key:example:infura
ETHERSCAN_API_KEY=your-etherscan-apikey
SEPOLIA_PRIVATE_KEY=your-wallet-account-private-key


```

## Scripts

```shell
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts
```

### License

This project is licensed under the MIT License.
