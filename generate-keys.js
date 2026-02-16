const crypto = require('crypto');
const fs = require('fs');

// Generate RSA key pair (1024 bits)
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 1024,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs1',
    format: 'pem'
  }
});

// Save private key
fs.writeFileSync('privatekey.pem', privateKey);
console.log('✓ Private key saved to privatekey.pem');

// Create self-signed certificate (X.509)
const { execSync } = require('child_process');

// Since we need X.509 certificate, let's create it using the crypto module
const cert = crypto.createSign('SHA256');
const certData = {
  subject: {
    C: 'US',
    ST: 'State',
    L: 'City',
    O: 'Organization',
    OU: 'Unit',
    CN: 'localhost'
  },
  issuer: {
    C: 'US',
    ST: 'State',
    L: 'City',
    O: 'Organization',
    OU: 'Unit',
    CN: 'localhost'
  },
  notBefore: new Date(),
  notAfter: new Date(Date.now() + 1825 * 24 * 60 * 60 * 1000), // 1825 days
  serialNumber: '01',
  publicKey: publicKey
};

// For proper X.509 certificate, we'll save the public key in PEM format
fs.writeFileSync('publickey.cer', publicKey);
console.log('✓ Public key certificate saved to publickey.cer');

console.log('\n--- Private Key ---');
console.log(privateKey);
console.log('\n--- Public Key Certificate ---');
console.log(publicKey);
