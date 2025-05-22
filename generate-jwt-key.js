import crypto from "crypto";
// Générer une clé aléatoire de 256 bits (32 caractères hexadécimaux)
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('Votre clé JWT :', jwtSecret);