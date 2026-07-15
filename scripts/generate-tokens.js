#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function generateToken() {
    const timestamp = Math.floor(Date.now() / 1000);
    const random = crypto.randomBytes(4).toString('hex');
    return `shellti-client-${timestamp}-${random}`;
}

function askQuestion(question) {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
}

async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--interactive')) {
        console.log('\n🔑 Generador de Tokens - ShellTI\n');

        const empresa = await askQuestion('Nombre de empresa: ');
        const email = await askQuestion('Email de contacto: ');
        const dias = await askQuestion('Días válido (ej: 30): ');

        if (!empresa || !email || !dias) {
            console.error('❌ Error: Completa todos los campos');
            rl.close();
            process.exit(1);
        }

        const token = generateToken();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(dias));

        console.log('\n✅ Token generado:\n');
        console.log(`   Empresa: ${empresa}`);
        console.log(`   Email: ${email}`);
        console.log(`   Token: ${token}`);
        console.log(`   Válido hasta: ${expiryDate.toISOString().split('T')[0]}`);
        console.log(`\nURL: https://shellti.com/deep-diagnostic.html\n`);

        // Save to CSV (opcional)
        const csvLine = `${empresa},${email},${token},${expiryDate.toISOString().split('T')[0]}\n`;
        const csvFile = path.join(__dirname, '../tokens-generados.csv');

        if (!fs.existsSync(csvFile)) {
            fs.writeFileSync(csvFile, 'Empresa,Email,Token,Válido Hasta\n');
        }
        fs.appendFileSync(csvFile, csvLine);
        console.log(`📝 Token guardado en tokens-generados.csv\n`);

        rl.close();
    } else if (args.includes('--batch')) {
        console.log('🔄 Modo batch (lectura desde CSV)');
        console.log('📋 Esperando: clientes-ejemplo.csv con formato: Name,Email,Days\n');

        const csvFile = path.join(__dirname, '../clientes-ejemplo.csv');
        if (!fs.existsSync(csvFile)) {
            console.error('❌ No encontrado: clientes-ejemplo.csv');
            console.log('📝 Crea un archivo con formato:\n   Name,Email,Days\n   Empresa1,email1@company.cl,30\n');
            rl.close();
            process.exit(1);
        }

        const content = fs.readFileSync(csvFile, 'utf-8');
        const lines = content.split('\n').slice(1).filter(l => l.trim());

        const outputFile = path.join(__dirname, '../tokens-batch-' + Date.now() + '.csv');
        fs.writeFileSync(outputFile, 'Empresa,Email,Token,Válido Hasta\n');

        console.log(`📊 Procesando ${lines.length} clientes...\n`);

        lines.forEach((line, idx) => {
            const [empresa, email, dias] = line.split(',').map(s => s.trim());
            if (empresa && email && dias) {
                const token = generateToken();
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + parseInt(dias));

                const csvLine = `${empresa},${email},${token},${expiryDate.toISOString().split('T')[0]}\n`;
                fs.appendFileSync(outputFile, csvLine);

                console.log(`  ✓ ${idx + 1}. ${empresa} → ${token}`);
            }
        });

        console.log(`\n✅ Tokens guardados en: ${path.basename(outputFile)}\n`);
        rl.close();
    } else {
        console.log('Uso:');
        console.log('  npm run generate:token          # Modo interactivo');
        console.log('  npm run generate:batch          # Desde CSV\n');
        rl.close();
    }
}

main().catch(err => {
    console.error('Error:', err.message);
    rl.close();
    process.exit(1);
});
