const solc = require('solc');
const fs = require('fs');
const path = require('path');

const contractsDir = path.join(__dirname, 'contracts');
const nodeModulesDir = path.join(__dirname, 'node_modules');
const outputDir = path.join(__dirname, 'build');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const sources = {};
const files = fs.readdirSync(contractsDir).filter(f => f.endsWith('.sol'));

files.forEach(file => {
    const content = fs.readFileSync(path.join(contractsDir, file), 'utf8');
    sources[file] = { content };
});

const input = {
    language: 'Solidity',
    sources: sources,
    settings: {
        evmVersion: 'cancun',
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode']
            }
        }
    }
};

function findImports(importPath) {
    let fullPath;
    if (importPath.startsWith('@openzeppelin/')) {
        fullPath = path.join(nodeModulesDir, importPath);
    } else if (importPath.startsWith('../') || importPath.startsWith('./')) {
        fullPath = path.join(contractsDir, importPath);
        if (!fs.existsSync(fullPath)) {
             fullPath = path.join(nodeModulesDir, importPath);
        }
    } else {
        fullPath = path.join(contractsDir, importPath);
    }

    if (fs.existsSync(fullPath)) {
        return { contents: fs.readFileSync(fullPath, 'utf8') };
    }
    
    if (importPath.includes('@openzeppelin')) {
         const parts = importPath.split('/');
         const ozIndex = parts.indexOf('@openzeppelin');
         const ozPath = parts.slice(ozIndex).join('/');
         fullPath = path.join(nodeModulesDir, ozPath);
         if (fs.existsSync(fullPath)) {
             return { contents: fs.readFileSync(fullPath, 'utf8') };
         }
    }

    return { error: 'File not found: ' + importPath };
}

console.log("Compiling contracts...");
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
    let hasError = false;
    output.errors.forEach(err => {
        console.error(err.formattedMessage);
        if (err.severity === 'error') hasError = true;
    });
    if (hasError) {
        process.exit(1);
    }
}

for (const fileName in output.contracts) {
    for (const contractName in output.contracts[fileName]) {
        const contract = output.contracts[fileName][contractName];
        const abi = JSON.stringify(contract.abi);
        const bytecode = contract.evm.bytecode.object;

        fs.writeFileSync(path.join(outputDir, `${contractName}_abi.json`), abi);
        fs.writeFileSync(path.join(outputDir, `${contractName}_bytecode.txt`), '0x' + bytecode);
        console.log(`Saved ${contractName} artifacts`);
    }
}
