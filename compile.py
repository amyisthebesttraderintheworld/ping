import solcx
import json
import os

# Install solc if not present
solcx.install_solc('0.8.20')
solcx.set_solc_version('0.8.20')

contracts_dir = 'contracts'
output_dir = 'build'

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Mapping for OpenZeppelin imports
import_remappings = [
    '@openzeppelin/=/data/data/com.termux/files/home/pïng/node_modules/@openzeppelin/'
]

def compile_all():
    files = [f for f in os.listdir(contracts_dir) if f.endswith('.sol')]
    for file in files:
        print(f"Compiling {file}...")
        try:
            compiled_sol = solcx.compile_files(
                [os.path.join(contracts_dir, file)],
                output_values=['abi', 'bin'],
                import_remappings=import_remappings
            )
            
            for contract_id, contract_interface in compiled_sol.items():
                contract_name = contract_id.split(':')[-1]
                with open(f'{output_dir}/{contract_name}.json', 'w') as f:
                    json.dump(contract_interface, f)
                print(f"Saved {contract_name} to {output_dir}")
        except Exception as e:
            print(f"Failed to compile {file}: {e}")

if __name__ == "__main__":
    compile_all()
