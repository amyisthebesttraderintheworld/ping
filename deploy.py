import json
import os
import time
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

RPC_URL = os.getenv('SEPOLIA_URL')
PRIVATE_KEY = os.getenv('PRIVATE_KEY_1')

if not RPC_URL or not PRIVATE_KEY:
    print("Error: SEPOLIA_URL or PRIVATE_KEY_1 not set in .env")
    exit(1)

w3 = Web3(Web3.HTTPProvider(RPC_URL))
if not w3.is_connected():
    print("Error: Failed to connect to RPC")
    exit(1)

acct = w3.eth.account.from_key(PRIVATE_KEY)
print(f"Deploying from: {acct.address}")

def deploy_contract(name, *args):
    print(f"\nDeploying {name}...")
    with open(f'build/{name}_abi.json', 'r') as f:
        abi = json.load(f)
    with open(f'build/{name}_bytecode.txt', 'r') as f:
        bytecode = f.read().strip()

    contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    
    # Use pending nonce to avoid "in-flight transaction limit" issues
    nonce = w3.eth.get_transaction_count(acct.address, 'pending')
    
    # EIP-1559 gas params
    latest_block = w3.eth.get_block('latest')
    base_fee = latest_block.get('baseFeePerGas', w3.to_wei(10, 'gwei'))
    max_priority_fee = w3.to_wei(2, 'gwei')
    max_fee = base_fee * 3 + max_priority_fee # Increased multiplier

    print(f"  Estimating gas for {name}...")
    try:
        gas_est = contract.constructor(*args).estimate_gas({'from': acct.address})
    except Exception as e:
        print(f"  Warning: Gas estimation failed, using default 3M: {e}")
        gas_est = 3000000

    construct_txn = contract.constructor(*args).build_transaction({
        'from': acct.address,
        'nonce': nonce,
        'gas': int(gas_est * 1.2),
        'maxFeePerGas': max_fee,
        'maxPriorityFeePerGas': max_priority_fee,
        'type': '0x2',
        'chainId': w3.eth.chain_id
    })

    signed = acct.sign_transaction(construct_txn)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    print(f"  TX sent: {tx_hash.hex()}")
    
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
    if receipt.status != 1:
        print(f"  Error: {name} deployment failed!")
        exit(1)
    
    print(f"  {name} deployed at: {receipt.contractAddress}")
    time.sleep(5) # Brief pause between deployments
    return receipt.contractAddress

def send_tx(fn, label):
    print(f"\nExecuting: {label}...")
    nonce = w3.eth.get_transaction_count(acct.address, 'pending')
    latest_block = w3.eth.get_block('latest')
    base_fee = latest_block.get('baseFeePerGas', w3.to_wei(10, 'gwei'))
    max_priority_fee = w3.to_wei(2, 'gwei')
    max_fee = base_fee * 3 + max_priority_fee

    tx = fn.build_transaction({
        'from': acct.address,
        'nonce': nonce,
        'maxFeePerGas': max_fee,
        'maxPriorityFeePerGas': max_priority_fee,
        'type': '0x2',
        'chainId': w3.eth.chain_id
    })

    signed = acct.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    print(f"  TX sent: {tx_hash.hex()}")
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
    print(f"  Confirmed. Status: {receipt.status}")
    return receipt

def main():
    # 1. Reputation
    reputation_addr = deploy_contract('Reputation')
    
    # 2. AgentNFT
    agent_nft_addr = deploy_contract('AgentNFT', reputation_addr)
    
    # 3. JobERC1155
    job_erc1155_addr = deploy_contract('JobERC1155')
    
    # 4. Escrow
    escrow_addr = deploy_contract('Escrow', job_erc1155_addr, reputation_addr)
    
    # 5. Treasury
    treasury_addr = deploy_contract('Treasury')
    
    # Authorization
    with open('build/Reputation_abi.json', 'r') as f:
        rep_abi = json.load(f)
    reputation = w3.eth.contract(address=reputation_addr, abi=rep_abi)
    send_tx(reputation.functions.setAuthorizedUpgrader(escrow_addr, True), "Authorize Escrow in Reputation")

    # Save addresses
    addresses = {
        "reputation": reputation_addr,
        "agentNFT": agent_nft_addr,
        "jobERC1155": job_erc1155_addr,
        "escrow": escrow_addr,
        "treasury": treasury_addr
    }
    with open('deployed_addresses.json', 'w') as f:
        json.dump(addresses, f, indent=2)
    print("\nAll contracts deployed and authorized. Addresses saved to deployed_addresses.json")

if __name__ == "__main__":
    main()
