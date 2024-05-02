import { Metaplex } from "@metaplex-foundation/js";
import { Connection, ParsedAccountData, PublicKey } from "@solana/web3.js";
import fs from "fs";

const main = async () => {
  // if (!fs.existsSync("./snapshot")) fs.mkdirSync("./snapshot");

  const nfts = fs.readFileSync("./snapshot/paingelz/allnfts.json", "utf-8");

  const data = JSON.parse(nfts);

  const hashes: string[] = [];

  data.forEach((nft: any) => {
    hashes.push(nft.mintAddress);
  });

  fs.writeFileSync("./snapshot/paingelz/hashes.json", JSON.stringify(hashes));

  // const connection = new Connection(
  //   // `https://ancient-boldest-aura.solana-mainnet.quiknode.pro/${process.env.QUICKNODE_API_KEY}/`
  //   `https://burned-yolo-field.solana-mainnet.quiknode.pro/6f52ca71d8ccde970c375b38bdd8070062e68ab0/`
  // );
  // const metaplex = new Metaplex(connection);

  // const data: any = await metaplex.nfts().findAllByCreator({
  //   creator: new PublicKey("GrwudmZhRoMnvNG9soabxd7JFbDsV3btBzMbHpDGU7DX"),
  // });

  // fs.mkdirSync("./snapshot/paingelz");
  // fs.writeFileSync("./snapshot/paingelz/allnfts.json", JSON.stringify(data));

  // const wallets: any[] = [];

  // for (let i = 0; i < data.length; i++) {
  //   const address = new PublicKey(data[i].mintAddress);

  //   const largestAccount = await connection.getTokenLargestAccounts(address);

  //   const parsedLargestAccountInfo = await connection.getParsedAccountInfo(
  //     largestAccount.value[0].address
  //   );

  //   const parsedData = parsedLargestAccountInfo.value
  //     ?.data as ParsedAccountData;

  //   const wallet = parsedData.parsed.info.owner;

  //   if (wallets.includes(wallet)) {
  //     console.log("Duplicate wallet found: ", wallet);
  //     continue;
  //   }

  //   console.log(`${i + 1} Adding wallet:`, wallet);
  //   wallets.push(wallet);
  // }

  // fs.writeFileSync(
  //   "./snapshot/paingelz/wallets4.json",
  //   JSON.stringify(wallets)
  // );
};

main();
