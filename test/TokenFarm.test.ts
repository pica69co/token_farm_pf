import { expect } from "chai";
import { ethers } from "hardhat";

describe("TokenFarm", function () {
  let dappToken: any;
  let lpToken: any;
  let tokenFarm: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const DAppTokenFactory = await ethers.getContractFactory("DAppToken");
    dappToken = await DAppTokenFactory.deploy(owner.address);
    const LPTokenFactory = await ethers.getContractFactory("LPToken");
    lpToken = await LPTokenFactory.deploy(owner.address);
    const TokenFarmFactory = await ethers.getContractFactory("TokenFarm");
    tokenFarm = await TokenFarmFactory.deploy(
      dappToken.getAddress(),
      lpToken.getAddress()
    );

    // Transferir propiedad de DAppToken a TokenFarm
    await dappToken.transferOwnership(await tokenFarm.getAddress());
  });

  async function setupStake(user: any, amount: number) {
    await lpToken.connect(owner).mint(user.address, amount);
    await lpToken.connect(user).approve(await tokenFarm.getAddress(), amount);
    await tokenFarm.connect(user).deposit(amount);
  }

  it("Permite a un usuario depositar tokens LP y actualiza el balance", async function () {
    await setupStake(addr1, 100);
    const stakingInfo = await tokenFarm.stakerInfo(addr1.address);
    expect(stakingInfo.balance).to.equal(100);
  });

  it("Calcula y distribuye recompensas después de incrementar el tiempo", async function () {
    await setupStake(addr1, 100);

    // Simular el paso del tiempo
    await ethers.provider.send("evm_increaseTime", [100]);
    await ethers.provider.send("evm_mine", []);

    await tokenFarm.distributeRewardsAll();
    const stakingInfo = await tokenFarm.stakerInfo(addr1.address);
    expect(stakingInfo.rewards).to.be.gt(0);
  });

  it("Permite reclamar recompensas acumuladas", async function () {
    await setupStake(addr1, 100);

    // Incrementar el tiempo y distribuir recompensas
    await ethers.provider.send("evm_increaseTime", [100]);
    await ethers.provider.send("evm_mine", []);
    await tokenFarm.distributeRewardsAll();

    const initialBalance = await dappToken.balanceOf(addr1.address);
    await tokenFarm.connect(addr1).claimRewards();
    const finalBalance = await dappToken.balanceOf(addr1.address);
    expect(finalBalance).to.be.gt(initialBalance);
  });

  it("Permite retirar tokens LP con tarifa aplicada", async function () {
    await setupStake(addr1, 100);

    const fee = Math.floor(100 * 0.005); // Tarifa del 0.5%
    const expectedWithdrawal = 100 - fee;

    await tokenFarm.connect(addr1).withdraw();
    const stakingInfo = await tokenFarm.stakerInfo(addr1.address);
    expect(stakingInfo.balance).to.equal(0);

    const userBalance = await lpToken.balanceOf(addr1.address);
    expect(userBalance).to.equal(expectedWithdrawal);
  });
});
