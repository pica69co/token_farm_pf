# Ejercicio Simple DeFi Yield Farming

### Proyecto:

En este ejercicio, implementarás un proyecto DeFi simple de Token Farm.

La Farm debe permitir a los usuarios realizar depósitos y retiros de un token mock LP.  
Los usuarios también pueden reclamar las recompensas generadas durante el staking. Estas recompensas son tokens de la plataforma: nombre: "DApp Token", token: "DAPP".  
El contrato contiene el marco y comentarios necesarios para implementar el contrato. Sigue los comentarios indicados para completarlo.

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

# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
npx hardhat ignition deploy ignition/modules/Lock.ts --network sepolia --verify
```
