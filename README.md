# AES & Square Attack on 4-Round Implementation in TypeScript

This repository contains an implementation of the **Advanced Encryption Standard (AES)** written in **TypeScript**.  
It includes both the core AES components (S-box, key expansion, encryption/decryption) and Square Attack.

## Project Structure

- **`index.ts`** – Entry point and high-level AES logic.  
- **`Sbox.ts`** – AES S-box and inverse S-box tables.  
- **`helpers.ts`** – Utility functions (byte/word transformations, etc.).  
- **`client.ts`** – Example usage / test client.  
- **`attackRelated.ts`** – Code related to cryptanalysis (e.g., square attack).  

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/I-Kazanci/AES-4-Round-Attack.git
   cd AES-4-Round-Attack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the project**
   ```bash
   npx ts-node index.ts
   ```

## Features

- AES core implementation in TypeScript.
- S-box & inverse S-box lookup tables.
- Helper functions for Galois Field arithmetic.
- Example client code for testing.
- Fully functional Square Attack on Round 4-AES.

##  License

MIT License – feel free to use, modify, and share.
