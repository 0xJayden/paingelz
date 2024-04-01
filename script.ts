import { Metaplex } from "@metaplex-foundation/js";
import {
  Connection,
  ParsedAccountData,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";
import fs from "fs";

const main = async () => {
  // if (!fs.existsSync("./snapshot")) fs.mkdirSync("./snapshot");

  const connection = new Connection(
    `https://ancient-boldest-aura.solana-mainnet.quiknode.pro/${process.env.QUICKNODE_API_KEY}/`
  );
  const metaplex = new Metaplex(connection);

  //   const data = await metaplex.nfts().findAllByCreator({
  //     creator: new PublicKey("3dNZmWCMDs9EsXDVsAEz7yhzjUSY2r33wHPMnYMxfZdX"),
  //   });
  //   fs.writeFileSync("./snapshot/snapshot.json", JSON.stringify(data));

  const snapshot = fs.readFileSync("./snapshot/snapshot.json", "utf8");
  const parsedSnapshot = JSON.parse(snapshot);

  const wallets: any[] = [];

  for (let i = 0; i < parsedSnapshot.length; i++) {
    const address = new PublicKey(parsedSnapshot[i].mintAddress);

    const largestAccount = await connection.getTokenLargestAccounts(address);

    const parsedLargestAccountInfo = await connection.getParsedAccountInfo(
      largestAccount.value[0].address
    );

    const parsedData = parsedLargestAccountInfo.value
      ?.data as ParsedAccountData;

    const wallet = parsedData.parsed.info.owner;

    if (wallets.includes(wallet)) {
      console.log("Duplicate wallet found: ", wallet);
      continue;
    }

    wallets.push(parsedData.parsed.info.owner);
  }

  fs.writeFileSync("./snapshot/wallets.json", JSON.stringify(wallets));
};

const filterWallets = () => {
  const wallets = fs.readFileSync("./snapshot/wallets.json", "utf8");
  const parsedWallets = JSON.parse(wallets);
  const filteredWallets: any[] = [];

  for (let wallet of parsedWallets) {
    if (filteredWallets.includes(wallet)) {
      console.log("Duplicate wallet found: ", wallet);
      continue;
    }
    filteredWallets.push(wallet);
  }

  console.log("Total wallets: ", parsedWallets.length);
  console.log("Filtered wallets: ", filteredWallets.length);

  fs.writeFileSync(
    "./snapshot/filteredWallets.json",
    JSON.stringify(filteredWallets)
  );
};

// main();
filterWallets();
