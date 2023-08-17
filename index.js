import { General } from "./config.js";
import { ArgentWalletGenerator } from "./utils/argent/argentWalletGenerator.js";
import { WalletSaver } from "./utils/WalletSaver.js";
import {
  deployArgentWallets,
  deployBraavosWallets,
  loadArgentWallets,
  loadBraavosWallets,
} from "./utils/helpers.js";
import { fileURLToPath } from "url";
import path from "path";
import { BraavosWalletGenerator } from "./utils/braavos/braavosWalletGenerator.js";
import { createObjectCsvWriter as createCsvWriter } from "csv-writer";

console.log("Created by SYBIL-MAFIA. Modified by BlathanAevon")
const numWallet = General.numWallets;
const walletsData = [];

(async () => {
  if (General.wallet === "argent") {
    if (General.generate) {
      console.log(`Start generating ${numWallet} Argent X wallets`);
      const walletsData = [];

      for (let i = 0; i < numWallet; i++) {
        const walletData = await ArgentWalletGenerator.getWalletData();
        walletsData.push(walletData);
      }

      const csvWriter = createCsvWriter({
        path: "wallets.csv",
        header: [
          { id: "seed", title: "Seed" },
          { id: "address", title: "Address" },
          { id: "privateKey", title: "Private Key" },
          { id: "publicKey", title: "Public Key" },
        ],
      });

      const csvRecords = walletsData.map((walletData) => ({
        seed: walletData.seed,
        address: walletData.address,
        privateKey: walletData.privateKey,
        publicKey: walletData.publicKey,
      }));

      csvWriter
        .writeRecords(csvRecords)
        .then(() => {
          console.log("CSV file has been written successfully.");
          console.log(
            "Don't forget to add addresses to whitelist on OKX and disable generate in config."
          );
        })
        .catch((error) => {
          console.error("Error writing CSV file:", error);
        });

      return;
    }

    if (General.deploy) {
      console.log("Starting Deploying Argent X wallets.");
      const { addresses, privateKeys, publicKeys } = await loadArgentWallets();

      const limiter = General.num_deployers;
      const results = await deployArgentWallets(
        addresses,
        privateKeys,
        publicKeys,
        limiter
      );

      console.log("Deployment completed successfully.");
      console.log("Deployed addresses:", results);
    }
  } else if (General.wallet === "braavos") {
    if (General.generate) {
      console.log(`Start generating ${numWallet} Braavos wallets`);
      for (let i = 0; i < numWallet; i++) {
        const walletData = await BraavosWalletGenerator.getWalletData();
        walletsData.push(walletData);
      }

      const currentModulePath = path.dirname(fileURLToPath(import.meta.url));
      const dataFolderPath = path.join(currentModulePath, "data");
      WalletSaver.saveDataToFiles(walletsData, dataFolderPath, General.wallet);
      console.log(
        "Don't forget to add addresses to whitelist on OKX and disable generate in config."
      );
      return;
    }

    if (General.deploy) {
      console.log("Starting Deploying Braavos wallets.");
      const { addresses, privateKeys, mnemonics } = await loadBraavosWallets();

      const limiter = General.num_deployers;
      const results = await deployBraavosWallets(
        addresses,
        privateKeys,
        mnemonics,
        limiter
      );

      console.log("Deployment completed successfully.");
      console.log("Deployed addresses:", results);
    }
  }
})();
