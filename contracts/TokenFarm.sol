// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;
/**
 * @author Oscar W arrieta
 * @title Proportional Token Farm
 * @notice Una granja de staking donde las recompensas se distribuyen proporcionalmente al total stakeado.
 */

import "./DappToken.sol";
import "./LPToken.sol";

contract TokenFarm {
    // Variables de estado
    string public name = "Proportional LPToken Farm";
    address public owner;
    DAppToken public dappToken;
    LPToken public lpToken;

    uint256 public constant REWARD_PER_BLOCK = 1e18; // Recompensa por bloque
    uint256 public totalStakingBalance; // Total de tokens en staking

    address[] public stakers;
    uint256 public withdrawalFee = 50; // Fee del 0.5% (en puntos base)

    struct Staker {
        uint256 balance;
        uint256 rewards;
        uint256 checkpoint;
        bool hasStaked;
        bool isStaking;
    }

    mapping(address => Staker) public stakerInfo;

    // Eventos
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount, uint256 fee);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsDistributed(address indexed owner);
    event FeeUpdated(uint256 newFee);

    // Constructor
    constructor(DAppToken _dappToken, LPToken _lpToken) {
        dappToken = _dappToken;
        lpToken = _lpToken;
        owner = msg.sender;
    }

    // Modificador para funciones restringidas al propietario
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    /**
     * @notice Actualiza la tarifa de retiro.
     * @param _newFee Nueva tarifa de retiro (en puntos base, 1% = 100).
     */
    function updateWithdrawalFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 500, "Fee cannot exceed 5%");
        withdrawalFee = _newFee;
        emit FeeUpdated(_newFee);
    }

    /**
     * @notice Deposita tokens LP para staking.
     * @param _amount Cantidad de tokens LP a depositar.
     */
    function deposit(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");

        // Transferir tokens LP al contrato
        lpToken.transferFrom(msg.sender, address(this), _amount);

        // Distribuir recompensas pendientes antes de actualizar balances
        distributeRewards(msg.sender);

        // Actualizar información del staker
        Staker storage staker = stakerInfo[msg.sender];
        staker.balance += _amount;
        staker.isStaking = true;
        if (!staker.hasStaked) {
            staker.hasStaked = true;
            stakers.push(msg.sender);
        }
        totalStakingBalance += _amount;

        // Actualizar checkpoint si no existe
        if (staker.checkpoint == 0) {
            staker.checkpoint = block.number;
        }

        emit Deposit(msg.sender, _amount);
    }

    /**
     * @notice Retira todos los tokens LP en staking, aplicando una tarifa.
     */
    function withdraw() external {
        Staker storage staker = stakerInfo[msg.sender];
        require(staker.isStaking, "User is not staking");
        require(staker.balance > 0, "Staking balance must be greater than 0");

        // Distribuir recompensas pendientes antes de retirar
        distributeRewards(msg.sender);

        // Calcular la tarifa de retiro
        uint256 fee = (staker.balance * withdrawalFee) / 10000;
        uint256 amountAfterFee = staker.balance - fee;

        // Actualizar balances
        totalStakingBalance -= staker.balance;
        staker.balance = 0;
        staker.isStaking = false;

        // Transferir tokens LP al usuario y la tarifa al propietario
        lpToken.transfer(msg.sender, amountAfterFee);
        if (fee > 0) {
            lpToken.transfer(owner, fee);
        }

        emit Withdraw(msg.sender, amountAfterFee, fee);
    }

    /**
     * @notice Reclama recompensas pendientes.
     */
    function claimRewards() external {
        Staker storage staker = stakerInfo[msg.sender];
        require(staker.rewards > 0, "No rewards to claim");

        uint256 pendingAmount = staker.rewards;
        staker.rewards = 0;

        // Acuñar recompensas utilizando DappToken
        dappToken.mint(msg.sender, pendingAmount);

        emit RewardsClaimed(msg.sender, pendingAmount);
    }

    /**
     * @notice Distribuye recompensas a todos los usuarios en staking.
     */
    function distributeRewardsAll() external onlyOwner {
        for (uint256 i = 0; i < stakers.length; i++) {
            address stakerAddress = stakers[i];
            if (stakerInfo[stakerAddress].isStaking) {
                distributeRewards(stakerAddress);
            }
        }
        emit RewardsDistributed(msg.sender);
    }

    /**
     * @notice Calcula y distribuye las recompensas proporcionalmente al staking total.
     * @param beneficiary Dirección del usuario beneficiario.
     */
    function distributeRewards(address beneficiary) private {
        Staker storage staker = stakerInfo[beneficiary];
        require(block.number > staker.checkpoint, "No blocks passed since last checkpoint");
        require(totalStakingBalance > 0, "Total staking balance must be greater than 0");

        // Calcular bloques transcurridos
        uint256 blocksPassed = block.number - staker.checkpoint;

        // Calcular participación proporcional
        uint256 share = (staker.balance * 1e18) / totalStakingBalance;

        // Calcular recompensas
        uint256 reward = (REWARD_PER_BLOCK * blocksPassed * share) / 1e18;

        // Acumular recompensas pendientes
        staker.rewards += reward;

        // Actualizar checkpoint
        staker.checkpoint = block.number;
    }
    // Función para obtener el total de tokens en staking
    function getTotalStakingBalance() public view returns (uint256) {
        return totalStakingBalance;
    }
    // Función para obtener el total de LP tokens en el Pool
    function getLPTokenBalance() public view returns (uint256) {
        return lpToken.balanceOf(address(this));
    }
}
