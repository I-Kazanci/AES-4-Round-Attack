# AES Implementation in TypeScript

This repository contains an implementation of the **Advanced Encryption Standard (AES)** written in **TypeScript**.  
It includes both the core AES components (S-box, key expansion, encryption/decryption) and some attack-related experiments.

## 📂 Project Structure

- **`index.ts`** – Entry point and high-level AES logic.  
- **`Sbox.ts`** – AES S-box and inverse S-box tables.  
- **`helpers.ts`** – Utility functions (finite field operations, byte/word transformations, etc.).  
- **`client.ts`** – Example usage / test client.  
- **`attackRelated.ts`** – Code related to cryptanalysis (e.g., square/partial sum attacks).  
- **`notes`** – Additional notes and references used during development.  

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```

2. **Install dependencies**
   (if you have a `package.json`)
   ```bash
   npm install
   ```

3. **Run the project**
   ```bash
   npx ts-node index.ts
   ```

## 🛠 Features

- AES core implementation in TypeScript.
- S-box & inverse S-box lookup tables.
- Helper functions for Galois Field arithmetic.
- Example client code for testing.
- Early exploration of AES cryptanalysis techniques.

## 📜 License

MIT License – feel free to use, modify, and share.
