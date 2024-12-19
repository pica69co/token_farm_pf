import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("TokenFarm", function () {
  async function deployTokenFarmFixture() {
    const [owner, user1, user2] = await hre.ethers.getSigners();

    // Desplegar DAppToken
    const DAppToken = await hre.ethers.getContractFactory("DAppToken");
    const dappToken = await DAppToken.deploy();
    await dappToken.waitForDeployment();

    // Desplegar LPToken
    const LPToken = await hre.ethers.getContractFactory("LPToken");
    const lpToken = await LPToken.deploy();
    await lpToken.waitForDeployment();

    // Desplegar TokenFarm
    const TokenFarm = await hre.ethers.getContractFactory("TokenFarm");
    const tokenFarm = await TokenFarm.deploy(
      dappToken.getAddress(),
      lpToken.getAddress()
    );
    await tokenFarm.waitForDeployment();

    // Asignar tokens LP a usuarios
    await lpToken.transfer(user1.address, hre.ethers.parseEther("100"));
    await lpToken.transfer(user2.address, hre.ethers.parseEther("200"));

    return { tokenFarm, dappToken, lpToken, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Debe configurar correctamente las direcciones de los contratos", async function () {
      const { tokenFarm, dappToken, lpToken } = await loadFixture(
        deployTokenFarmFixture
      );

      expect(await tokenFarm.dappToken()).to.equal(
        await dappToken.getAddress()
      );
      expect(await tokenFarm.lpToken()).to.equal(await lpToken.getAddress());
    });

    it("Debe asignar al despliegue el propietario correcto", async function () {
      const { tokenFarm, owner } = await loadFixture(deployTokenFarmFixture);
      expect(await tokenFarm.owner()).to.equal(owner.address);
    });
  });

  describe("Deposits", function () {
    it("Permite a un usuario depositar tokens LP y actualiza el balance", async function () {
      const { tokenFarm, lpToken, user1 } = await loadFixture(
        deployTokenFarmFixture
      );

      const depositAmount = hre.ethers.parseEther("50");
      await lpToken
        .connect(user1)
        .approve(await tokenFarm.getAddress(), depositAmount);

      await tokenFarm.connect(user1).deposit(depositAmount);

      const staker = await tokenFarm.stakerInfo(user1.address);
      expect(staker.balance).to.equal(depositAmount);
    });

    it("Rechaza depósitos sin aprobación de tokens LP", async function () {
      const { tokenFarm, user1 } = await loadFixture(deployTokenFarmFixture);

      const depositAmount = hre.ethers.parseEther("50");

      await expect(
        tokenFarm.connect(user1).deposit(depositAmount)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  });

  describe("Withdrawals", function () {
    it("Permite a un usuario retirar tokens LP con una tarifa aplicada", async function () {
      const { tokenFarm, lpToken, user1, owner } = await loadFixture(
        deployTokenFarmFixture
      );

      const depositAmount = hre.ethers.parseEther("100");
      const fee = depositAmount / BigInt(200); // 0.5% de tarifa
      const amountAfterFee = depositAmount - fee;

      // Aprobar y depositar tokens
      await lpToken
        .connect(user1)
        .approve(await tokenFarm.getAddress(), depositAmount);
      await tokenFarm.connect(user1).deposit(depositAmount);

      // Retirar tokens
      await expect(() =>
        tokenFarm.connect(user1).withdraw()
      ).to.changeTokenBalances(lpToken, [user1, owner], [amountAfterFee, fee]);
    });

    it("Rechaza retiros cuando el usuario no tiene balance en staking", async function () {
      const { tokenFarm, user1 } = await loadFixture(deployTokenFarmFixture);
      await expect(tokenFarm.connect(user1).withdraw()).to.be.revertedWith(
        "Staking balance must be greater than 0"
      );
    });
  });

  describe("Rewards", function () {
    it("Calcula y acumula recompensas correctamente después de varios bloques", async function () {
      const { tokenFarm, lpToken, user1 } = await loadFixture(
        deployTokenFarmFixture
      );

      const depositAmount = hre.ethers.parseEther("50");

      // Aprobar y depositar tokens
      await lpToken
        .connect(user1)
        .approve(await tokenFarm.getAddress(), depositAmount);
      await tokenFarm.connect(user1).deposit(depositAmount);

      // Avanzar bloques
      await time.increase(10);

      // Reclamar recompensas
      await tokenFarm.connect(user1).claimRewards();

      const rewards = await tokenFarm.stakerInfo(user1.address);
      expect(rewards.rewards).to.equal(0); // Las recompensas deben haberse reclamado
    });
  });

  describe("Owner Actions", function () {
    it("Permite al propietario actualizar la tarifa de retiro", async function () {
      const { tokenFarm, owner } = await loadFixture(deployTokenFarmFixture);

      await tokenFarm.connect(owner).updateWithdrawalFee(100); // 1%
      const fee = await tokenFarm.withdrawalFee();

      expect(fee).to.equal(100);
    });

    it("Rechaza la actualización de la tarifa por usuarios no autorizados", async function () {
      const { tokenFarm, user1 } = await loadFixture(deployTokenFarmFixture);

      await expect(
        tokenFarm.connect(user1).updateWithdrawalFee(100)
      ).to.be.revertedWith("Only the owner can call this function");
    });
  });
});
