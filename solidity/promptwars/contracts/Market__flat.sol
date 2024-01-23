// Sources flattened with hardhat v2.18.3 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Context.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/interfaces/draft-IERC6093.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (interfaces/draft-IERC6093.sol)
pragma solidity ^0.8.20;

/**
 * @dev Standard ERC20 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC20 tokens.
 */
interface IERC20Errors {
    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param balance Current balance for the interacting account.
     * @param needed Minimum amount required to perform a transfer.
     */
    error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC20InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC20InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `spender`’s `allowance`. Used in transfers.
     * @param spender Address that may be allowed to operate on tokens without being their owner.
     * @param allowance Amount of tokens a `spender` is allowed to operate with.
     * @param needed Minimum amount required to perform a transfer.
     */
    error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC20InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `spender` to be approved. Used in approvals.
     * @param spender Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC20InvalidSpender(address spender);
}

/**
 * @dev Standard ERC721 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC721 tokens.
 */
interface IERC721Errors {
    /**
     * @dev Indicates that an address can't be an owner. For example, `address(0)` is a forbidden owner in EIP-20.
     * Used in balance queries.
     * @param owner Address of the current owner of a token.
     */
    error ERC721InvalidOwner(address owner);

    /**
     * @dev Indicates a `tokenId` whose `owner` is the zero address.
     * @param tokenId Identifier number of a token.
     */
    error ERC721NonexistentToken(uint256 tokenId);

    /**
     * @dev Indicates an error related to the ownership over a particular token. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param tokenId Identifier number of a token.
     * @param owner Address of the current owner of a token.
     */
    error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC721InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC721InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     * @param tokenId Identifier number of a token.
     */
    error ERC721InsufficientApproval(address operator, uint256 tokenId);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC721InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC721InvalidOperator(address operator);
}

/**
 * @dev Standard ERC1155 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC1155 tokens.
 */
interface IERC1155Errors {
    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param balance Current balance for the interacting account.
     * @param needed Minimum amount required to perform a transfer.
     * @param tokenId Identifier number of a token.
     */
    error ERC1155InsufficientBalance(address sender, uint256 balance, uint256 needed, uint256 tokenId);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC1155InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC1155InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     * @param owner Address of the current owner of a token.
     */
    error ERC1155MissingApprovalForAll(address operator, address owner);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC1155InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC1155InvalidOperator(address operator);

    /**
     * @dev Indicates an array length mismatch between ids and values in a safeBatchTransferFrom operation.
     * Used in batch transfers.
     * @param idsLength Length of the array of token identifiers
     * @param valuesLength Length of the array of token amounts
     */
    error ERC1155InvalidArrayLength(uint256 idsLength, uint256 valuesLength);
}


// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}


// File @openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/extensions/IERC20Metadata.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface for the optional metadata functions from the ERC20 standard.
 */
interface IERC20Metadata is IERC20 {
    /**
     * @dev Returns the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the decimals places of the token.
     */
    function decimals() external view returns (uint8);
}


// File @openzeppelin/contracts/token/ERC20/ERC20.sol@v5.0.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.20;




/**
 * @dev Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
 *
 * TIP: For a detailed writeup see our guide
 * https://forum.openzeppelin.com/t/how-to-implement-erc20-supply-mechanisms/226[How
 * to implement supply mechanisms].
 *
 * The default value of {decimals} is 18. To change this, you should override
 * this function so it returns a different value.
 *
 * We have followed general OpenZeppelin Contracts guidelines: functions revert
 * instead returning `false` on failure. This behavior is nonetheless
 * conventional and does not conflict with the expectations of ERC20
 * applications.
 *
 * Additionally, an {Approval} event is emitted on calls to {transferFrom}.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 */
abstract contract ERC20 is Context, IERC20, IERC20Metadata, IERC20Errors {
    mapping(address account => uint256) private _balances;

    mapping(address account => mapping(address spender => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei. This is the default value returned by this function, unless
     * it's overridden.
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() public view virtual returns (uint8) {
        return 18;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - the caller must have a balance of at least `value`.
     */
    function transfer(address to, uint256 value) public virtual returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, value);
        return true;
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * NOTE: If `value` is the maximum `uint256`, the allowance is not updated on
     * `transferFrom`. This is semantically equivalent to an infinite approval.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 value) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, value);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20}.
     *
     * NOTE: Does not update the allowance if the current allowance
     * is the maximum `uint256`.
     *
     * Requirements:
     *
     * - `from` and `to` cannot be the zero address.
     * - `from` must have a balance of at least `value`.
     * - the caller must have allowance for ``from``'s tokens of at least
     * `value`.
     */
    function transferFrom(address from, address to, uint256 value) public virtual returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transfer(from, to, value);
        return true;
    }

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * NOTE: This function is not virtual, {_update} should be overridden instead.
     */
    function _transfer(address from, address to, uint256 value) internal {
        if (from == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(from, to, value);
    }

    /**
     * @dev Transfers a `value` amount of tokens from `from` to `to`, or alternatively mints (or burns) if `from`
     * (or `to`) is the zero address. All customizations to transfers, mints, and burns should be done by overriding
     * this function.
     *
     * Emits a {Transfer} event.
     */
    function _update(address from, address to, uint256 value) internal virtual {
        if (from == address(0)) {
            // Overflow check required: The rest of the code assumes that totalSupply never overflows
            _totalSupply += value;
        } else {
            uint256 fromBalance = _balances[from];
            if (fromBalance < value) {
                revert ERC20InsufficientBalance(from, fromBalance, value);
            }
            unchecked {
                // Overflow not possible: value <= fromBalance <= totalSupply.
                _balances[from] = fromBalance - value;
            }
        }

        if (to == address(0)) {
            unchecked {
                // Overflow not possible: value <= totalSupply or value <= fromBalance <= totalSupply.
                _totalSupply -= value;
            }
        } else {
            unchecked {
                // Overflow not possible: balance + value is at most totalSupply, which we know fits into a uint256.
                _balances[to] += value;
            }
        }

        emit Transfer(from, to, value);
    }

    /**
     * @dev Creates a `value` amount of tokens and assigns them to `account`, by transferring it from address(0).
     * Relies on the `_update` mechanism
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * NOTE: This function is not virtual, {_update} should be overridden instead.
     */
    function _mint(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(address(0), account, value);
    }

    /**
     * @dev Destroys a `value` amount of tokens from `account`, lowering the total supply.
     * Relies on the `_update` mechanism.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * NOTE: This function is not virtual, {_update} should be overridden instead
     */
    function _burn(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        _update(account, address(0), value);
    }

    /**
     * @dev Sets `value` as the allowance of `spender` over the `owner` s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     *
     * Overrides to this logic should be done to the variant with an additional `bool emitEvent` argument.
     */
    function _approve(address owner, address spender, uint256 value) internal {
        _approve(owner, spender, value, true);
    }

    /**
     * @dev Variant of {_approve} with an optional flag to enable or disable the {Approval} event.
     *
     * By default (when calling {_approve}) the flag is set to true. On the other hand, approval changes made by
     * `_spendAllowance` during the `transferFrom` operation set the flag to false. This saves gas by not emitting any
     * `Approval` event during `transferFrom` operations.
     *
     * Anyone who wishes to continue emitting `Approval` events on the`transferFrom` operation can force the flag to
     * true using the following override:
     * ```
     * function _approve(address owner, address spender, uint256 value, bool) internal virtual override {
     *     super._approve(owner, spender, value, true);
     * }
     * ```
     *
     * Requirements are the same as {_approve}.
     */
    function _approve(address owner, address spender, uint256 value, bool emitEvent) internal virtual {
        if (owner == address(0)) {
            revert ERC20InvalidApprover(address(0));
        }
        if (spender == address(0)) {
            revert ERC20InvalidSpender(address(0));
        }
        _allowances[owner][spender] = value;
        if (emitEvent) {
            emit Approval(owner, spender, value);
        }
    }

    /**
     * @dev Updates `owner` s allowance for `spender` based on spent `value`.
     *
     * Does not update the allowance value in case of infinite allowance.
     * Revert if not enough allowance is available.
     *
     * Does not emit an {Approval} event.
     */
    function _spendAllowance(address owner, address spender, uint256 value) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            if (currentAllowance < value) {
                revert ERC20InsufficientAllowance(spender, currentAllowance, value);
            }
            unchecked {
                _approve(owner, spender, currentAllowance - value, false);
            }
        }
    }
}


// File contracts/Market.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;


contract Market is Ownable {
    // ================================================================
    // |                        STRUCTS                                 |
    // ================================================================

    struct MarketData {
        // The IPFS reference-image hash of the expected prompts
        string imageUri;
        // Datetime nanos: the market is open
        uint startsAt;
        // Datetime nanos: the market is closed
        uint endsAt;
    }

    struct Player {
        // the account id of the outcomeToken
        address id;
        // the outcome value, in this case, the prompt submitted to the competition
        string prompt;
        // the outcome value, in this case, the prompt submitted to the competition
        string outputImgUri;
        // store the result from the image comparison: percentageDiff or pixelDifference
        string result;
        // total supply of this outcomeToken
        uint balance;
    }

    struct CollateralToken {
        // The ERC20 token address
        address id;
        // The ERC20 token balance
        uint balance;
        // The ERC20 token decimals
        uint decimals;
        // The ERC20 token fee balance
        uint feeBalance;
    }

    struct Resolution {
        // Time to free up the market
        uint window;
        // Time after the market ends and before the resolution window starts
        uint revealWindow;
        // When the market is resolved, set only by fn resolve
        uint resolvedAt;
        // When the market is resolved, set only by fn resolve
        address playerId;
    }

    struct Management {
        // Gets sent fees when claiming window is open
        string daoAccountId;
        // Gets back the storage deposit upon self-destruction
        string marketCreatorAccountId;
        // Set at initialization, the market may be destroyed by the creator to claim the storage deposit
        uint selfDestructWindow;
        // Set at initialization, determines when to close bets
        uint buySellThreshold;
    }

    struct Fees {
        // Price to charge when creating an outcome token
        uint price;
        // Decimal fee to charge upon a bet
        uint feeRatio;
        // When fees got sent to the DAO
        uint claimedAt;
    }

    struct CreateOutcomeTokenArgs {
        // the outcome value, in this case, the prompt submitted to the competition
        string prompt;
    }

    // ================================================================
    // |                            STATE                             |
    // ================================================================

    mapping(address => Player) players;
    address[] private _playerIds;

    MarketData private _market;
    Resolution private _resolution;
    Fees private _fees;
    Management private _management;
    CollateralToken private _collateralToken;

    // ================================================================
    // |                        MODIFIERS                             |
    // ================================================================

    modifier assertBeforeEnd() {
        require(is_before_market_ends(), "ERR_EVENT_ENDED");
        _;
    }

    modifier assertEnoughParticipants() {
        require(_playerIds.length > 0, "ERR_RESOLVE_0_PARTICIPANTS");
        _;
    }

    modifier assertIsNotResolved() {
        require(!is_resolved(), "ERR_EVENT_IS_RESOLVED");
        _;
    }

    modifier assertIsRevealWindowOpen() {
        require(!is_reveal_window_expired(), "ERR_REVEAL_WINDOW_EXPIRED");
        _;
    }

    modifier assertIsResolutionWindowOpen() {
        require(
            !is_resolution_window_expired(),
            "ERR_RESOLUTION_WINDOW_EXPIRED"
        );
        _;
    }

    modifier assertPrice(uint amount) {
        require(amount >= _fees.price, "ERR_ASSERT_PRICE_INSUFFICIENT_AMOUNT");
        _;
    }

    modifier assertIsPlayerRegistered(address playerId) {
        require(player_exists(playerId), "ERR_PLAYER_IS_NOT_REGISTERED");
        _;
    }

    modifier assertPlayerIsNotRegistered(address playerId) {
        require(!player_exists(playerId), "ERR_PLAYER_EXISTS");
        _;
    }

    // ================================================================
    // |                        CONSTANTS                             |
    // ================================================================

    uint constant EVENT_PERIOD_TIMESTAMP = 5 minutes;
    uint constant STAGE_PERIOD_TIMESTAMP = 5 minutes;
    uint constant SELF_DESTRUCT_TIMESTAMP = 7 days;
    uint constant CREATE_OUTCOME_TOKEN_PRICE = 10_000;
    uint constant FEE_RATIO = 20;
    uint constant BUY_SELL_THRESHOLD = 75;

    // ================================================================
    // |                          Events                              |
    // ================================================================

    event RegisterPlayer(
        uint amount,
        address outcomeId,
        uint supply,
        uint fee,
        uint collateralTokenBalance,
        uint collateralTokenFeeBalance
    );

    event RevealPlayerResult(
        address playerId,
        string result,
        string outputImgUri
    );

    event ResolutionSuccess(
        address playerId,
        string result,
        string outputImgUri
    );

    event InternalSellUnresolved(address payee, uint amount);
    event InternalSellResolved(address payee, uint amount);

    // ================================================================
    // |                          PUBLIC                              |
    // ================================================================

    /**
     * @notice Constructs a new Market contract.
     * @dev Contract deployment involves a series of initializations including market dates, management parameters, collateral balance, resolution timing, and fees.
     * @param market An instance of the MarketData struct that contains the attributes of the market such as the image URI and the start and end timings.
     * @param management An instance of the Management struct that contains fields necessary for managing the contract such as the DAO account ID, the creator account ID, the window to self-destruct, and the threshold to determine when to close bets.
     * @param collateralToken An instance of the CollateralToken struct that contains token-related data such as the token id, its balance, decimals, and the fee balance.
     */
    constructor(
        MarketData memory market,
        Management memory management,
        CollateralToken memory collateralToken
    ) Ownable(msg.sender) {
        uint startsAt = market.startsAt;
        uint endsAt = startsAt + EVENT_PERIOD_TIMESTAMP;
        uint revealWindow = endsAt + STAGE_PERIOD_TIMESTAMP;
        uint resolutionWindow = revealWindow + STAGE_PERIOD_TIMESTAMP;
        uint selfDestructWindow = resolutionWindow + SELF_DESTRUCT_TIMESTAMP;

        market.startsAt = startsAt;
        market.endsAt = endsAt;
        _market = market;

        management.selfDestructWindow = selfDestructWindow;
        management.buySellThreshold = BUY_SELL_THRESHOLD;
        _management = management;

        collateralToken.balance = 0;
        collateralToken.feeBalance = 0;
        _collateralToken = collateralToken;

        _resolution.window = resolutionWindow;
        _resolution.revealWindow = revealWindow;

        _fees.price = CREATE_OUTCOME_TOKEN_PRICE;
        _fees.feeRatio = FEE_RATIO;
    }

    /**
     * @notice This function is used to create a new Player record. A Player may enter the game before the event starts.
     * @notice A player must have approved an ERC20 of minimum the game price amount to get registered.
     * @notice A player executes this transaction. A player registers itself.
     * @param prompt A string value representing the prompt submitted to the competition. This becomes the outcome value of the created outcome token.
     * @dev we may change "prompt" for "value" in the future, so that we store any data for any game (or modify it depending on the game)
     */
    function register(
        string memory prompt
    ) public assertPlayerIsNotRegistered(msg.sender) assertBeforeEnd {
        address playerId = msg.sender;

        uint amount = _internal_transfer_from(
            playerId,
            address(this),
            _fees.price
        );

        Player storage player = players[playerId];

        uint amountMintable;
        uint fee;
        (amountMintable, fee) = get_amount_mintable(amount);

        player.id = playerId;
        player.prompt = prompt;
        player.balance = amountMintable;

        _playerIds.push(playerId);

        players[playerId] = player;

        _collateralToken.balance += amount;
        _collateralToken.feeBalance += fee;

        emit RegisterPlayer(
            amount,
            playerId,
            player.balance,
            fee,
            _collateralToken.balance,
            _collateralToken.feeBalance
        );
    }

    /**
     * @notice This function is used to reveal a player's result.
     * @param playerId The ID of the player to reveal the result for.
     * @param result The player's result. This value may vary from game to game. in this case, is the percentage of the image prompt result comparison.
     * @param outputImgUri The output image URI of the player.
     */
    function reveal(
        address playerId,
        string memory result,
        string memory outputImgUri
    )
        public
        onlyOwner
        assertIsRevealWindowOpen
        assertIsPlayerRegistered(playerId)
        assertIsNotResolved
    {
        Player storage player = players[playerId];

        player.result = result;
        player.outputImgUri = outputImgUri;

        emit RevealPlayerResult(playerId, result, outputImgUri);
    }

    /**
     * @notice This function is used to resolve the market.
     * @dev Only the owner can resolve the market.
     * @param playerId The ID of the player to resolve the market for.
     */
    function resolve(
        address playerId
    )
        public
        onlyOwner
        assertEnoughParticipants
        assertIsResolutionWindowOpen
        assertIsNotResolved
        assertIsPlayerRegistered(playerId)
    {
        _resolution.playerId = playerId;
        _resolution.resolvedAt = block.timestamp;

        Player storage player = players[playerId];

        string memory result = player.result;
        string memory outputImgUri = player.outputImgUri;

        emit ResolutionSuccess(playerId, result, outputImgUri);
    }

    /**
     * @notice This function is used to claim a player's balance.
     * @dev A player executes this transaction. A player sells its current balance.
     * @return The amount sold.
     */
    function sell() public returns (uint) {
        if (is_expired_unresolved()) {
            return _internal_sell_unresolved();
        }

        return _internal_sell_resolved();
    }

    // ================================================================
    // |                        Public VIEWS                          |
    // ================================================================

    /**
     * @return The market data of the contract.
     */
    function get_market_data() public view returns (MarketData memory) {
        return _market;
    }

    /**
     * @return The resolution data of the contract.
     */
    function get_resolution_data() public view returns (Resolution memory) {
        return _resolution;
    }

    /**
     * @return The fees data of the contract.
     */
    function get_fees_data() public view returns (Fees memory) {
        return _fees;
    }

    /**
     * @return The management data of the contract.
     */
    function get_management_data() public view returns (Management memory) {
        return _management;
    }

    /**
     * @return The collateral token data of the contract.
     */
    function get_collateral_token_data()
        public
        view
        returns (CollateralToken memory)
    {
        return _collateralToken;
    }

    /**
     * @param playerId The player's address.
     * @return The outcome token data of a specified player.
     */
    function get_player(
        address playerId
    ) public view assertIsPlayerRegistered(playerId) returns (Player memory) {
        return players[playerId];
    }

    /**
     * @param amount The amount to be minted.
     * @return The amount of mintable tokens and the fee.
     */
    function get_amount_mintable(uint amount) public view returns (uint, uint) {
        uint fee = _calculate_percentage(amount, _fees.feeRatio);
        uint amountMintable = amount - fee;

        return (amountMintable, fee);
    }

    /**
     * @return The total number of players.
     */
    function get_players_count() public view returns (uint256) {
        return _playerIds.length;
    }

    /**
     * @return The current block timestamp
     */
    function get_block_timestamp() public view returns (uint256) {
        return block.timestamp;
    }

    // ================================================================
    // |                        PUBLIC FLAGS                          |
    // ================================================================

    /**
     * @notice Check if the contract is resolved.
     * @dev Compares current timestamp with resolution window.
     * @return bool Whether the contract is resolved or not.
     */
    function is_resolved() public view returns (bool) {
        return _resolution.resolvedAt != 0;
    }

    /**
     * @dev Check if the current block timestamp is before the market ends.
     * @return bool Whether the current block timestamp is before the market ends or not.
     */
    function is_before_market_ends() public view returns (bool) {
        return block.timestamp <= _market.endsAt;
    }

    /**
     * @dev Check if the reveal window is expired.
     * @return bool Whether the reveal window is expired or not.
     */
    function is_reveal_window_expired() public view returns (bool) {
        return block.timestamp > _resolution.revealWindow;
    }

    /**
     * @dev Check if the resolution window is expired.
     * @return bool Whether the resolution window is expired or not.
     */
    function is_resolution_window_expired() public view returns (bool) {
        return block.timestamp > _resolution.window;
    }

    /**
     * @dev Check if the market is expired and unresolved.
     * @return bool Whether the market is expired and unresolved or not.
     */
    function is_expired_unresolved() public view returns (bool) {
        return
            !is_before_market_ends() &&
            is_resolution_window_expired() &&
            !is_resolved();
    }

    /**
     * @dev Checks if a player exists.
     * @param playerId The address of the player to check.
     * @return A boolean indicating whether the player exists.
     */
    function player_exists(address playerId) public view returns (bool) {
        return address(players[playerId].id) != address(0);
    }

    // ================================================================
    // |                        INTERNAL                              |
    // ================================================================

    /**
     * @dev Handles the internal selling process for unresolved game matches.
     * @return The balance of the player after the selling process.
     */
    function _internal_sell_unresolved() private returns (uint) {
        address senderId = msg.sender;

        Player memory payee = get_player(senderId);

        uint playerBalance = payee.balance;

        uint amountMintable;
        (amountMintable, ) = get_amount_mintable(_fees.price);

        // @TODO test for this error and method
        require(
            playerBalance == amountMintable,
            "ERR_SELL_INSUFFICIENT_BALANCE"
        );

        _internal_transfer(senderId, playerBalance);

        payee.balance = 0;

        emit InternalSellUnresolved(senderId, playerBalance);

        return playerBalance;
    }

    /**
     * @dev Private: handles the internal selling process for resolved transactions.
     * @return The balance of the player after the selling process.
     */
    function _internal_sell_resolved() private returns (uint) {
        address playerId = msg.sender;

        require(
            _collateralToken.balance > 0,
            "ERR_SELL_RESOLVED_INSUFFICIENT_FUNDS"
        );

        require(
            _resolution.playerId == playerId,
            "ERR_SELL_RESOLVED_SENDER_IS_NOT_WINNER"
        );

        uint amountPayable = _collateralToken.balance -
            _collateralToken.feeBalance;

        _internal_transfer(playerId, amountPayable);

        _collateralToken.balance = 0;

        emit InternalSellResolved(playerId, amountPayable);

        return amountPayable;
    }

    /**
     * @dev Private: handles the internal transfer process.
     * @param _to The address to transfer the amount to.
     * @param _amount The amount to transfer.
     * @return The amount transferred.
     */
    function _internal_transfer(
        address _to,
        uint _amount
    ) private returns (uint) {
        address _tokenAddr = _collateralToken.id;

        ERC20 token = ERC20(_tokenAddr);

        // @TODO test error and method
        require(token.transfer(_to, _amount), "ERR_INTERNAL_TRANSFER_FAILED");

        return _amount;
    }

    /**
     * @dev Private: handles the internal transfer from process.
     * @param _from The address to transfer the amount from.
     * @param _to The address to transfer the amount to.
     * @param _amount The amount to transfer.
     * @return The amount transferred.
     */
    function _internal_transfer_from(
        address _from,
        address _to,
        uint _amount
    ) private returns (uint) {
        address _tokenAddr = _collateralToken.id;

        ERC20 token = ERC20(_tokenAddr);

        // @TODO test error and method
        require(
            token.transferFrom(_from, _to, _amount),
            "ERR_INTERNAL_TRANSFER_FROM_FAILED"
        );

        return _amount;
    }

    // ================================================================
    // |                        PRIVATE UTILS                         |
    // ================================================================

    /**
     * @notice Calculate percentage of amount.
     * @dev Used for calculating fees and other percentage based calculations.
     * @param amount The base amount.
     * @param bps Basis Points. The percentage.
     * @return uint The calculated amount after applying the percentage.
     */
    function _calculate_percentage(
        uint amount,
        uint bps
    ) private pure returns (uint) {
        require((amount * bps) >= 10_000);

        return (amount * bps) / 10_000;
    }
}
