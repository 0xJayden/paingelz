import Image from "next/image";
import { Inter } from "next/font/google";
import Icon from "@mdi/react";
import { mdiClose } from "@mdi/js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import Head from "next/head";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  fetchCandyMachine,
  mintV2,
  mplCandyMachine,
  safeFetchCandyGuard,
} from "@metaplex-foundation/mpl-candy-machine";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import {
  generateSigner,
  publicKey,
  some,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { base58 } from "@metaplex-foundation/umi/serializers";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [openMint, setOpenMint] = useState(false);
  const [dots, setDots] = useState<Array<Dot>>([]);
  const [openSplash, setOpenSplash] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement>();
  const [playing, setPlaying] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [focusedWindow, setFocusedWindow] = useState<
    "mint" | "map" | "game" | "personality"
  >("mint");
  const [openGame, setOpenGame] = useState(false);
  const [openPersonalityTest, setOpenPersonalityTest] = useState(false);

  const requestRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const animate = (t: number) => {
    if (timeRef.current === 0) timeRef.current = t;
    const timeElapsed = t - timeRef.current;
    if (timeElapsed > 10000) {
      timeRef.current = 0;
      setDots([]);
    }

    setDots((prev) => {
      return prev.map((dot) => {
        if (!dot.xAcceleration) return dot;
        let newX = dot.x + dot.xSpeed * dot.xAcceleration;
        let newY = dot.y + dot.ySpeed * dot.yAcceleration;
        let newYAcceleration = dot.yAcceleration + 0.02;
        let newXAcceleration = dot.xAcceleration + 0.02;

        return {
          x: newX,
          y: newY,
          xSpeed: dot.xSpeed,
          ySpeed: dot.ySpeed,
          yAcceleration: newYAcceleration,
          xAcceleration: newXAcceleration,
          size: dot.size,
          color: dot.color,
        };
      });
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  const generateDots = (e: MouseEvent) => {
    const newDots: Dot[] = [];
    for (let i = 0; i < 20; i++) {
      newDots.push({
        x: e.clientX + 10,
        y: e.clientY + 10,
        xSpeed: Math.random() * (Math.random() * 2 > 1 ? 2 : -2),
        ySpeed: Math.random() * (Math.random() * 2 > 1 ? 2 : -2),
        yAcceleration: 1.01,
        xAcceleration: 1.01,
        size: 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setDots(newDots);
  };

  useEffect(() => {
    setAudio(new Audio("/music.mp3"));
    document.addEventListener("click", generateDots);
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  useEffect(() => {
    if (!audio) return;
    if (playing) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [playing]);

  return (
    <main
      className={`absolute flex inset-0 overflow-hidden text-white bg-[#99ccff] flex-col items-center justify-between ${inter.className}`}
    >
      <Head>
        <title>Paingelz</title>
        <meta name="description" content="Feel the pain. Mint your Paingelz." />
        <meta name="title" content="Paingelz" />
        <link rel="icon" href="/faviconnew.ico" />
      </Head>
      {openSplash ? (
        <Splash
          setOpenSplash={setOpenSplash}
          setPlaying={setPlaying}
          setOpenMint={setOpenMint}
        />
      ) : (
        <>
          {dots.map((dot, i) => {
            return (
              <img
                key={i}
                src="/star.png"
                style={{ top: dot.y + "px", left: dot.x + "px" }}
                className="w-3 h-3 absolute z-50"
              />
              // <div
              //   key={i}
              //   id="dot"
              //   style={{
              //     top: dot.y + "px",
              //     left: dot.x + "px",
              //     backgroundColor: dot.color,
              //     height: dot.size + "px",
              //     width: dot.size + "px",
              //   }}
              //   className={`absolute rounded-full z-50`}
              // ></div>
            );
          })}
          <div className="absolute inset-0">
            <Image
              src={"/bgfinalnopaingelz.png"}
              className="w-full h-full object-cover"
              width={1000}
              height={1000}
              alt="bga"
            />
          </div>
          <div className="absolute bottom-20">
            <Image
              src={"/paingelzlogo.png"}
              width={400}
              height={400}
              alt="paingelzlogo"
            />
          </div>
          <IconContainer
            setOpenMint={setOpenMint}
            openMint={openMint}
            setOpenMap={setOpenMap}
            openMap={openMap}
            setFocusedWindow={setFocusedWindow}
            setOpenGame={setOpenGame}
            openGame={openGame}
            setOpenPersonalityTest={setOpenPersonalityTest}
            openPersonalityTest={openPersonalityTest}
          />
          {openMint && (
            <MintWindow
              setOpenMint={setOpenMint}
              setFocusedWindow={setFocusedWindow}
              focusedWindow={focusedWindow}
            />
          )}
          {openMap && (
            <MapWindow
              setOpenMap={setOpenMap}
              setFocusedWindow={setFocusedWindow}
              focusedWindow={focusedWindow}
            />
          )}
          {openGame && (
            <GameWindow
              setOpenGame={setOpenGame}
              setFocusedWindow={setFocusedWindow}
              focusedWindow={focusedWindow}
            />
          )}
          {openPersonalityTest && (
            <PersonalityTestWindow
              setOpenPersonalityTest={setOpenPersonalityTest}
              setFocusedWindow={setFocusedWindow}
              focusedWindow={focusedWindow}
            />
          )}
          <BottomNavbar
            setOpenMint={setOpenMint}
            openMint={openMint}
            setOpenMap={setOpenMap}
            openMap={openMap}
            setFocusedWindow={setFocusedWindow}
            setOpenGame={setOpenGame}
            openGame={openGame}
            setOpenPersonalityTest={setOpenPersonalityTest}
            openPersonalityTest={openPersonalityTest}
          />
        </>
      )}
    </main>
  );
}

type Dot = {
  x: number;
  y: number;
  xSpeed: number;
  ySpeed: number;
  yAcceleration: number;
  xAcceleration?: number;
  size: number;
  color: string;
};

const colors = [
  "red",
  "blue",
  "green",
  "yellow",
  "indigo",
  "pink",
  "purple",
  "white",
  "cyan",
];

const MintWindow = ({
  setOpenMint,
  setFocusedWindow,
  focusedWindow,
}: {
  setOpenMint: Dispatch<SetStateAction<boolean>>;
  setFocusedWindow: Dispatch<
    SetStateAction<"mint" | "map" | "game" | "personality">
  >;
  focusedWindow: "mint" | "map" | "game" | "personality";
}) => {
  const [dots, setDots] = useState<Array<Dot>>([]);
  const [price, setPrice] = useState<number>();
  const [clouds, setClouds] = useState<Array<Cloud>>([]);

  const dotContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  const wallet = useWallet();

  const umi = createUmi("https://api.devnet.solana.com")
    .use(walletAdapterIdentity(wallet))
    .use(mplCandyMachine())
    .use(mplTokenMetadata());

  const animate = () => {
    setClouds((prev) => {
      return prev.map((cloud) => {
        let newX = cloud.x + cloud.xSpeed;
        let newY = cloud.y + cloud.ySpeed;

        if (
          !dotContainerRef.current?.offsetWidth ||
          !dotContainerRef.current?.offsetHeight
        )
          return cloud;

        if (newX >= dotContainerRef.current.offsetWidth - 10 || newX <= 0) {
          cloud.xSpeed = -cloud.xSpeed;
        }

        if (newY >= dotContainerRef.current.offsetHeight - 20 || newY <= 10) {
          // cloud.yAcceleration = -cloud.yAcceleration;
          cloud.ySpeed = -cloud.ySpeed;
        }

        if (newY > dotContainerRef.current?.offsetHeight || newY < 0) {
          newY = Math.random() * dotContainerRef.current.offsetHeight - 20;
        }

        if (newX > dotContainerRef.current?.offsetWidth || newX < -5) {
          newX = Math.random() * dotContainerRef.current?.offsetWidth - 10;
        }

        return {
          x: newX,
          y: newY,
          size: cloud.size,
          xSpeed: cloud.xSpeed,
          ySpeed: cloud.ySpeed,
          yAcceleration: cloud.yAcceleration,
        };
      });
    });

    setDots((prev) => {
      return prev.map((dot) => {
        let newX = dot.x + dot.xSpeed;
        let newY = dot.y + dot.ySpeed * dot.yAcceleration;
        // let newYAcceleration = dot.yAcceleration;

        // if (dot.yAcceleration < 5) newYAcceleration = dot.yAcceleration + 0.02;

        if (
          !dotContainerRef.current?.offsetWidth ||
          !dotContainerRef.current?.offsetHeight
        )
          return dot;

        if (newX >= dotContainerRef.current.offsetWidth - 10 || newX <= 0) {
          dot.xSpeed = -dot.xSpeed;
        }

        if (newY >= dotContainerRef.current.offsetHeight - 20 || newY <= 10) {
          // dot.yAcceleration = -dot.yAcceleration;
          dot.ySpeed = -dot.ySpeed;
        }

        if (newY > dotContainerRef.current?.offsetHeight || newY < 0) {
          newY = Math.random() * dotContainerRef.current.offsetHeight - 20;
        }

        if (newX > dotContainerRef.current?.offsetWidth || newX < -5) {
          newX = Math.random() * dotContainerRef.current?.offsetWidth - 10;
        }

        return {
          x: newX,
          y: newY,
          xSpeed: dot.xSpeed,
          ySpeed: dot.ySpeed,
          yAcceleration: dot.yAcceleration,
          size: dot.size,
          color: dot.color,
        };
      });
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    getPrice();
    generateDots();
    generateClouds();
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const generateDots = () => {
    const newDots: Dot[] = [];
    for (let i = 0; i < 50; i++) {
      if (!dotContainerRef.current) return;
      newDots.push({
        x: Math.random() * dotContainerRef.current.offsetWidth - 10,
        y: Math.random() * dotContainerRef.current.offsetHeight - 20,
        xSpeed: Math.random() * 2,
        ySpeed: Math.random() * 2,
        yAcceleration: 1.01,
        size: 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setDots(newDots);
  };

  const generateClouds = () => {
    const clouds: Cloud[] = [];
    for (let i = 0; i < 50; i++) {
      clouds.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        xSpeed: Math.random() * (Math.random() * 2 > 1 ? 1.5 : -1.5),
        ySpeed: Math.random() * (Math.random() * 2 > 1 ? 1 : -1),
        yAcceleration: 1.01 * (Math.random() * 2 > 1 ? 1 : -1),
        size: 12,
      });
    }
    setClouds(clouds);
  };

  const getPrice = async () => {
    const candyMachine = await fetchCandyMachine(
      umi,
      publicKey("9FqygJoSDwh3kw31koPgoLkLKLaqh38tdebthABeG4C4")
    );

    const candyGuard = await safeFetchCandyGuard(
      umi,
      candyMachine.mintAuthority
    );

    setPrice(
      // @ts-ignore
      Number(candyGuard?.guards.solPayment.value.lamports.basisPoints) / 10 ** 9
    );
  };

  const mint = async () => {
    if (!wallet.publicKey) return console.log("No wallet connected");

    const candyMachine = await fetchCandyMachine(
      umi,
      publicKey("9FqygJoSDwh3kw31koPgoLkLKLaqh38tdebthABeG4C4")
    );

    const candyGuard = await safeFetchCandyGuard(
      umi,
      candyMachine.mintAuthority
    );

    try {
      const nftMint = generateSigner(umi);

      const transaction = transactionBuilder()
        .add(setComputeUnitLimit(umi, { units: 800000 }))
        .add(
          mintV2(umi, {
            candyMachine: candyMachine.publicKey,
            candyGuard: candyGuard?.publicKey,
            nftMint,
            collectionMint: candyMachine.collectionMint,
            collectionUpdateAuthority: candyMachine.authority,
            mintArgs: {
              solPayment: some({
                destination: publicKey(
                  "GgKt7kZNTQmi8J3TPPay7bk2G1VtJsV8gipfzyGajm8Z"
                ),
              }),
            },
          })
        );

      const { signature } = await transaction.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
      });

      const txid = base58.deserialize(signature)[0];
      console.log(`Minted NFT with txid: ${txid}`);
    } catch (error) {
      console.error(`Error minting NFT: ${error}`);
    }
  };

  return (
    <div
      className={`absolute animate-open inset-0 h-[60%] sm:h-[70%] overflow-hidden mx-auto my-auto w-[75%] text-[#00eeee]`}
      style={{ zIndex: focusedWindow === "mint" ? 30 : 20 }}
    >
      <div
        ref={dotContainerRef}
        className="flex flex-col h-full justify-center items-center relative border-2 rounded bg-black"
      >
        <button
          onClick={() => setFocusedWindow("mint")}
          className="absolute z-30 inset-0 cursor-default"
        ></button>
        <button
          onClick={() => {
            setOpenMint(false);
            return () => cancelAnimationFrame(requestRef.current);
          }}
          className="bg-red-500 rounded-full h-4 aspect-square flex justify-center items-center z-40 absolute top-1 left-1"
        >
          <Icon path={mdiClose} className="h-3 text-black" />
        </button>
        <div className="items-center absolute z-20 w-full space-x-2 flex top-0 left-0 h-6 p-1 right-0 bg-gradient-to-r from-[#c4c49a] via-[#eeeeee] to-[#c4c49a]">
          <p className="text-white pl-6 text-sm drop-shadow font-bold">
            Paingelz Mint
          </p>
        </div>
        <div className="flex w-full justify-center items-center">
          <video
            className="h-full w-[150px]"
            src="/paingelzlogo.mp4"
            muted
            autoPlay
            loop
            playsInline
          />
        </div>
        <div className="relative h-[70%] z-20 max-w-[1400px] w-full">
          <video
            className="h-full w-full"
            src="/paingelz.mp4"
            muted
            autoPlay
            loop
            playsInline
          />
        </div>
        <p>{price}</p>
        <button
          onClick={mint}
          className="absolute left-0 w-20 mx-auto right-0 bottom-[20%] z-30 border border-[#00eeee] p-1 px-5"
        >
          Mint
        </button>
        {dots.map((dot, i) => {
          return (
            // <div
            //   key={i}
            //   id="dot"
            //   style={{
            //     top: dot.y + "px",
            //     left: dot.x + "px",
            //     // backgroundColor: dot.color,
            //     color: dot.color,
            //     height: dot.size + "px",
            //     width: dot.size + "px",
            //   }}
            //   className={`absolute opacity-70 rounded-full`}
            // >
            //   *
            // </div>
            <img
              key={i}
              src="/star.png"
              style={{ top: dot.y + "px", left: dot.x + "px" }}
              className="w-3 h-3 absolute"
            />
          );
        })}
        {clouds.map((cloud, i) => {
          return (
            <img
              key={i}
              className="absolute"
              style={{
                top: cloud.y + "px",
                left: cloud.x + "px",
                height: cloud.size + "px",
                width: cloud.size + "px",
              }}
              src="/clouds.png"
            />
          );
        })}
      </div>
    </div>
  );
};

const IconContainer = ({
  setOpenMint,
  openMint,
  setOpenMap,
  openMap,
  setFocusedWindow,
  setOpenGame,
  openGame,
  setOpenPersonalityTest,
  openPersonalityTest,
}: {
  setOpenMint: Dispatch<SetStateAction<boolean>>;
  openMint: boolean;
  setOpenMap: Dispatch<SetStateAction<boolean>>;
  openMap: boolean;
  setFocusedWindow: Dispatch<
    SetStateAction<"mint" | "map" | "game" | "personality">
  >;
  setOpenGame: Dispatch<SetStateAction<boolean>>;
  openGame: boolean;
  setOpenPersonalityTest: Dispatch<SetStateAction<boolean>>;
  openPersonalityTest: boolean;
}) => {
  return (
    <div className="absolute space-y-4 p-4 inset-0 z-10">
      <MintIcon setOpenMint={setOpenMint} setFocusedWindow={setFocusedWindow} />
      <MapIcon setOpenMap={setOpenMap} setFocusedWindow={setFocusedWindow} />
      <GameIcon setOpenGame={setOpenGame} setFocusedWindow={setFocusedWindow} />
      <PersonalityIcon
        setOpenPersonalityTest={setOpenPersonalityTest}
        setFocusedWindow={setFocusedWindow}
      />
    </div>
  );
};

const MintIcon = ({
  setOpenMint,
  setFocusedWindow,
}: {
  setOpenMint: Dispatch<SetStateAction<boolean>>;
  setFocusedWindow: Dispatch<
    SetStateAction<"mint" | "map" | "game" | "personality">
  >;
}) => {
  const openWindow = () => {
    setOpenMint(true);
    setFocusedWindow("mint");
  };

  return (
    <button
      onClick={openWindow}
      className="h-20 flex items-center justify-center flex-col w-20"
    >
      <Image
        src={"/minticon.png"}
        width={100}
        height={100}
        alt="minticon"
        className="w-10 h-10"
      />
      <p className="text-sm drop-shadow text-center">Mint Paingelz</p>
    </button>
  );
};

const MapIcon = ({
  setOpenMap,
  setFocusedWindow,
}: {
  setOpenMap: Dispatch<SetStateAction<boolean>>;
  setFocusedWindow: Dispatch<
    SetStateAction<"mint" | "map" | "game" | "personality">
  >;
}) => {
  const openWindow = () => {
    setOpenMap(true);
    setFocusedWindow("map");
  };

  return (
    <button
      onClick={openWindow}
      className="h-20 flex items-center justify-center flex-col w-20"
    >
      <Image
        src={"/mapicon.png"}
        width={100}
        height={100}
        alt="mapicon"
        className="w-10 h-10"
      />
      <p className="text-sm drop-shadow text-center">Paingelz World</p>
    </button>
  );
};

const GameIcon = ({
  setOpenGame,
  setFocusedWindow,
}: {
  setOpenGame: Dispatch<SetStateAction<boolean>>;
  setFocusedWindow: Dispatch<
    SetStateAction<"mint" | "map" | "game" | "personality">
  >;
}) => {
  const openWindow = () => {
    setOpenGame(true);
    setFocusedWindow("game");
  };

  return (
    <button
      onClick={openWindow}
      className="h-20 w-20 flex items-center justify-center flex-col"
    >
      <Image
        src={"/gameicon.png"}
        width={100}
        height={100}
        alt="gameicon"
        className="w-10 h-10"
      />
      <p className="text-sm drop-shadow text-center">Play Game</p>
    </button>
  );
};

const BottomNavbar = ({
  setOpenMint,
  openMint,
  setOpenMap,
  openMap,
  setFocusedWindow,
  setOpenGame,
  openGame,
  setOpenPersonalityTest,
  openPersonalityTest,
}: {
  setOpenMint: Dispatch<SetStateAction<boolean>>;
  openMint: boolean;
  setOpenMap: Dispatch<SetStateAction<boolean>>;
  openMap: boolean;
  setFocusedWindow: Dispatch<
    SetStateAction<"mint" | "map" | "game" | "personality">
  >;
  setOpenGame: Dispatch<SetStateAction<boolean>>;
  openGame: boolean;
  setOpenPersonalityTest: Dispatch<SetStateAction<boolean>>;
  openPersonalityTest: boolean;
}) => {
  const openWindow = (window: "mint" | "map" | "game" | "personality") => {
    if (window === "mint") {
      setOpenMint(!openMint);
      setFocusedWindow("mint");
    } else if (window === "game") {
      setOpenGame(!openGame);
      setFocusedWindow("game");
    } else if (window === "personality") {
      setOpenPersonalityTest(!openPersonalityTest);
      setFocusedWindow("personality");
    } else {
      setOpenMap(!openMap);
      setFocusedWindow("map");
    }
  };

  return (
    <div className="absolute bottom-0 p-2 z-20 left-0 right-0 h-20">
      <div className="bg-[#20201d]/70 space-x-2 px-2 backdrop-blur h-full rounded-xl flex p-1 items-center">
        <WalletMultiButton />
        <div className="h-full border border-[#555555]"></div>
        <button
          onClick={() => openWindow("mint")}
          className="flex flex-col items-center space-y-1"
        >
          <Image
            src={"/minticon.png"}
            width={100}
            height={100}
            alt="minticon"
            className="w-10 h-10"
          />
          {openMint && <div className="rounded-full bg-white h-1 w-1"></div>}
        </button>
        <button
          onClick={() => openWindow("map")}
          className="flex flex-col pb-1 items-center space-y-1 rounded-full"
        >
          <Image
            className="h-10 w-10"
            src={"/mapicon.png"}
            alt="mapicon"
            width={100}
            height={100}
          />
          {openMap && <div className="rounded-full bg-white h-1 w-1"></div>}
        </button>
        <button
          onClick={() => openWindow("game")}
          className="flex flex-col items-center space-y-1"
        >
          <Image
            className="h-10 w-10"
            src={"/gameicon.png"}
            alt="gameicon"
            width={100}
            height={100}
          />
          {openGame && <div className="rounded-full bg-white h-1 w-1"></div>}
        </button>
        <button
          onClick={() => openWindow("personality")}
          className="flex flex-col items-center space-y-1"
        >
          <Image
            className="h-10 w-10"
            src="/brain.png"
            alt="personalityicon"
            width={100}
            height={100}
          />
          {openPersonalityTest && (
            <div className="rounded-full bg-white h-1 w-1"></div>
          )}
        </button>
      </div>
    </div>
  );
};

type Cloud = {
  x: number;
  y: number;
  size: number;
  xSpeed: number;
  ySpeed: number;
  yAcceleration: number;
};

const Splash = ({
  setOpenSplash,
  setPlaying,
  setOpenMint,
}: {
  setOpenSplash: Dispatch<SetStateAction<boolean>>;
  setPlaying: Dispatch<SetStateAction<boolean>>;
  setOpenMint: Dispatch<SetStateAction<boolean>>;
}) => {
  const [barWidth, setBarWidth] = useState("0%");
  const [dots, setDots] = useState<Array<Dot>>([]);
  const [clouds, setClouds] = useState<Array<Cloud>>([]);

  const requestRef = useRef<number>(0);

  useEffect(() => {
    setTimeout(() => {
      setBarWidth("5%");
    }, 200);
    setTimeout(() => {
      setBarWidth("10%");
    }, 500);
    setTimeout(() => {
      setBarWidth("15%");
    }, 800);
    setTimeout(() => {
      setBarWidth("22%");
    }, 1500);
    setTimeout(() => {
      setBarWidth("37%");
    }, 2500);
    setTimeout(() => {
      setBarWidth("50%");
    }, 3500);
    setTimeout(() => {
      setBarWidth("78%");
    }, 4000);
    setTimeout(() => {
      setBarWidth("91%");
    }, 4500);
    setTimeout(() => {
      setBarWidth("100%");
      generateDots();
      generateClouds();
      requestRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(requestRef.current);
    }, 4800);
  }, []);

  const animate = () => {
    setClouds((prev) => {
      return prev.map((cloud) => {
        let newX = cloud.x + cloud.xSpeed;
        let newY = cloud.y + cloud.ySpeed;
        // let newYSpeed = (cloud.ySpeed * 1) / cloud.yAcceleration;
        // let newYAcceleration = cloud.yAcceleration;

        if (newX > window.innerWidth) {
          newX = -cloud.size;
          newY = Math.random() * window.innerHeight;
        }
        if (newX < 0 - cloud.size) {
          newX = window.innerWidth;
          newY = Math.random() * window.innerHeight;
        }

        // if (newYSpeed > 6) {
        //   // newYSpeed = -newYSpeed;
        //   newYAcceleration = newYAcceleration;
        // } else if (newYSpeed <= 1) {
        //   newYSpeed = -newYSpeed;
        //   newYAcceleration = 1.01;
        // }

        return {
          x: newX,
          y: newY,
          size: cloud.size,
          xSpeed: cloud.xSpeed,
          ySpeed: cloud.ySpeed,
          yAcceleration: cloud.yAcceleration,
        };
      });
    });

    setDots((prev) => {
      return prev.map((dot) => {
        if (!dot.xAcceleration) return dot;
        let newX = dot.x + dot.xSpeed * dot.xAcceleration;
        let newY = dot.y + dot.ySpeed * dot.yAcceleration;
        let newYAcceleration = dot.yAcceleration + 0.02;
        let newXAcceleration = dot.xAcceleration + 0.02;

        return {
          x: newX,
          y: newY,
          xSpeed: dot.xSpeed,
          ySpeed: dot.ySpeed,
          yAcceleration: newYAcceleration,
          xAcceleration: newXAcceleration,
          size: dot.size,
          color: dot.color,
        };
      });
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  const generateDots = () => {
    const newDots: Dot[] = [];
    for (let i = 0; i < 50; i++) {
      newDots.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        xSpeed: Math.random() * (Math.random() * 2 > 1 ? 2 : -2),
        ySpeed: Math.random() * (Math.random() * 2 > 1 ? 2 : -2),
        yAcceleration: 1.01,
        xAcceleration: 1.01,
        size: 3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setDots(newDots);
  };

  const generateClouds = () => {
    const clouds: Cloud[] = [];
    for (let i = 0; i < 10; i++) {
      clouds.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        xSpeed: Math.random() * (Math.random() * 2 > 1 ? 1.5 : -1.5),
        ySpeed: Math.random() * (Math.random() * 2 > 1 ? 1 : -1),
        yAcceleration: 1.01 * (Math.random() * 2 > 1 ? 1 : -1),
        size: Math.random() * 100 + 5,
      });
    }
    setClouds(clouds);
  };

  const openGates = () => {
    setOpenSplash(false);
    setPlaying(true);
    setTimeout(() => {
      setOpenMint(true);
    }, 2000);
  };

  return (
    <div className="w-full relative h-screen pb-20 md:justify-start flex flex-col space-y-2 items-center justify-center bg-black">
      {clouds.map((cloud, i) => {
        return (
          <img
            key={i}
            className="absolute"
            style={{
              top: cloud.y + "px",
              left: cloud.x + "px",
              height: cloud.size + "px",
              width: cloud.size + "px",
            }}
            src="/clouds.png"
          />
        );
      })}
      {dots.map((dot, i) => {
        return (
          // <div
          //   key={i}
          //   id="dot"
          //   style={{
          //     top: dot.y + "px",
          //     left: dot.x + "px",
          //     backgroundColor: dot.color,
          //     height: dot.size + "px",
          //     width: dot.size + "px",
          //   }}
          //   className={`absolute rounded-full`}
          // ></div>
          <img
            key={i}
            src="/star.png"
            style={{ top: dot.y + "px", left: dot.x + "px" }}
            className="w-5 h-5 absolute z-50"
          />
        );
      })}
      <video
        src="/paingelzlogo.mp4"
        className="w-[50%] max-w-[700px]"
        autoPlay
        muted
        loop
        playsInline
      />
      <video
        src="/map.mp4"
        className="w-[50%] max-w-[700px] pb-4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="relative w-[50%] text-center border">
        <div
          style={{ width: `${barWidth}` }}
          className="absolute bg-cyan-500 h-full"
        ></div>
        <p className="relative">
          {barWidth} {barWidth === "100%" ? "Done" : "Loading..."}
        </p>
      </div>
      {barWidth === "100%" && (
        <div className="flex justify-center items-center">
          <div className="absolute animate-fadeUp flex justify-center bottom-[100px] items-center">
            <Image src={"/wings.png"} alt="wings" width={600} height={400} />
          </div>
          <button
            onClick={openGates}
            className="border absolute animate-fadeUp z-10 bg-black bottom-[180px] p-2 px-4"
          >
            Open the Gates
          </button>
        </div>
      )}
    </div>
  );
};

const MapWindow = ({
  setOpenMap,
  setFocusedWindow,
  focusedWindow,
}: {
  setOpenMap: Dispatch<SetStateAction<boolean>>;
  setFocusedWindow: Dispatch<
    SetStateAction<"mint" | "map" | "game" | "personality">
  >;
  focusedWindow: "mint" | "map" | "game" | "personality";
}) => {
  return (
    <div
      className={`absolute text-[#dedede] flex flex-col border-2 rounded h-[60%] md:h-[70%] animate-open w-[75%] top-0 ml-16 bottom-16 my-auto`}
      style={{ zIndex: focusedWindow === "map" ? 30 : 20 }}
    >
      <div className="absolute space-x-2 items-center flex z-30 top-0 w-full h-6 p-1 bg-gradient-to-r from-[#a6b5d4] via-[#dddddd] to-[#a6b5d4]">
        <button
          onClick={() => setOpenMap(false)}
          className="bg-red-500 rounded-full h-4 w-4 flex justify-center items-center"
        >
          <Icon path={mdiClose} className="h-3 text-black" />
        </button>
        <p className="text-sm text-white drop-shadow font-bold">
          Paingelz World
        </p>
      </div>
      <div
        onClick={() => setFocusedWindow("map")}
        className="flex pt-10 relative overflow-y-scroll flex-col bg-black"
      >
        <h2 className="text-2xl text-center font-bold">Paingelz World</h2>
        <div className="relative z-20 flex justify-center items-center w-full">
          <video
            className="max-w-[500px] w-full"
            src="/mapvid.mp4"
            muted
            autoPlay
            loop
            playsInline
          />
        </div>
        <div className="p-2 space-y-2">
          <p className="text-sm">{`In the celestial kingdom of Etherealia, six noble kingdoms reign over the vast expanse, each representing a different aspect of the divine realm.`}</p>
          <p className="font-bold pt-2">{`1. Serpahin Kingdom (star ones)`}</p>
          <p className="text-sm">{`Symbolizing purity and transcendence, Serphains hails from the gleaming city of Lumina, situated atop the highest peak in Etherealia. Its members possess ethereal beauty and radiant powers, revered as the epitome of angelic grace. They serve as guardians of the realm, their luminescent presence warding off the malevolent forces of House Red. serphanin kingdoms leader, the archangel Lumiel, is revered as the paragon of virtue and wisdom.`}</p>
          <p className="font-bold pt-2">{`2. **Infernals  **: (red)`}</p>
          <p className="text-sm">{`Emerging from the fiery depths of Infernia, the city of brimstone and despair, Los diablos embodies darkness and temptation. Its denizens, known as the infernals, wield formidable powers fueled by malice and ambition. Led by the enigmatic Fallen Seraph, Malphas, they seek to spread chaos and corruption throughout Etherealia, locked in eternal conflict with the forces of light.`}</p>
          <p className="font-bold pt-2">{`3. **Cascadiel Kingdom**:`}</p>
          <p className="text-sm">{`Nestled beneath the ocean's depths lies the city of Aquatica, home to Cascadiels. These aquatic angels harness the power of the sea, commanding mighty waves and currents. They are adept at navigating both the tranquil depths and treacherous waters, often serving as ambassadors between Etherealia and other realms. Despite their serene appearance, Cascadiels harbors a deep-seated rivalry with House Grey, stemming from ancient conflicts over territorial boundaries.`}</p>
          <p className="font-bold pt-2">{`4. **Ghastiel Kingdom **:`}</p>
          <p className="text-sm">{`Dwelling within the mist-shrouded city of Spectra, Ghastiels comprises spectral beings who straddle the line between the corporeal and the ethereal. Ghostly in appearance, they possess the ability to traverse the realms of the living and the dead, serving as guides for lost souls. Despite their neutrality, Ghastiels often finds themselves caught in the crossfire of the celestial conflict, their ethereal city serving as a battleground for opposing forces.`}</p>
          <p className="font-bold pt-2">{`5. **Cherublossom Realm**:`}</p>
          <p className="text-sm">{`Radiating with compassion and healing energy, Cherrublossoms call the blossoming city of Elysium home. Its members are adept healers and nurturers, possessing the ability to mend both body and spirit. They are known for their unwavering empathy and kindness, often extending their aid to those in need. Despite their benevolent nature, cherrublossoms faces disdain from some members of House Green, who view their pacifism as a sign of weakness.`}</p>
          <p className="font-bold pt-2">{`6. **Pridwin kingdom**: (green)`}</p>
          <p className="text-sm">{`Hailing from the verdant city of Sylvanis, Pridwins embodies cunning and resourcefulness. These stealthy angels are skilled in the arts of espionage and subterfuge, often operating in the shadows to gather intelligence and thwart their enemies' plans. While they possess a strong sense of loyalty to their allies, Pridwins ambition sometimes leads them into conflict with other houses, particularly Cherrublossom, whom they perceive as naive and vulnerable.`}</p>
          <div className="py-8 w-full text-center">---------</div>
          <p className="text-sm">{`Throughout the ages, the celestial kingdom of Etherealia has been embroiled in a perpetual struggle for dominance, as the six noble kingdoms vie for supremacy over the realm. Rivalries run deep, alliances shift like the tides, and the fate of Etherealia hangs in the balance as the forces of light and darkness clash in an eternal battle for control.`}</p>
          <p className="text-sm">{`In the depths of Etherealia, beyond the shimmering cities and celestial palaces, lies the Veil of Sorrow, a realm shrouded in darkness and despair. It is here that the paingelz
 dwell, angels born from the agony and anguish of sentient beings across the cosmos.`}</p>
          <p className="text-sm">{`Long ago, during a time of great turmoil, the ethereal energies of Etherealia coalesced within the Veil, giving rise to the first paingelz. These beings, forged from the very essence of suffering, possess a unique ability to empathize with the pain of others, granting them unparalleled insight into the depths of the human soul.`}</p>
          <p className="text-sm">{`However, the creation of the Paingelz was not without consequence. Their existence is a constant reminder of the pain and suffering that permeates the universe, and their presence has sparked fear and mistrust among the other celestial houses. Many view them as harbingers of doom, believing that their very existence threatens the delicate balance of Etherealia.`}</p>
          <p className="text-sm">{`As the celestial conflict rages on, the Paingelz find themselves torn between their innate empathy and the expectations of their fellow angels. Some seek to embrace their role as healers, using their unique gifts to alleviate the suffering of others and bring hope to the darkest corners of the cosmos. Others, however, succumb to the whispers of darkness, harnessing their pain-forged powers to sow chaos and destruction.`}</p>
          <p className="text-sm">{`Caught in the crossfire of the celestial war, the Paingelz must navigate a treacherous path, torn between their duty to protect the realm and the burden of their own existence. As they struggle to find their place in a world torn apart by conflict, the fate of Etherealia hangs in the balance, and only time will tell whether the Paingelz will be its salvation or its downfall.`}</p>
        </div>
      </div>
    </div>
  );
};

type GameObject = {
  x: number;
  y: number;
  xSpeed: number;
  ySpeed: number;
  yAcceleration: number;
  xAcceleration: number;
  size: number;
};

type PlayerObject = {
  x: number;
  y: number;
  height: number;
  width: number;
};

const GameWindow = ({
  setOpenGame,
  setFocusedWindow,
  focusedWindow,
}: {
  setOpenGame: Dispatch<SetStateAction<boolean>>;
  setFocusedWindow: Dispatch<
    SetStateAction<"game" | "map" | "mint" | "personality">
  >;
  focusedWindow: "game" | "map" | "mint" | "personality";
}) => {
  const [gameObject, setGameObject] = useState<GameObject>();
  const [playerObject, setPlayerObject] = useState<PlayerObject>();
  const [gameStatus, setGameStatus] = useState<"playing" | "paused" | "over">(
    "paused"
  );

  const requestRef = useRef<number>(0);
  const gameWindowRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerObject>();
  const score = useRef<number>(0);
  const collisionDetected = useRef<boolean>(false);

  const animate = () => {
    setGameObject((prev) => {
      if (!prev) return prev;
      if (!gameWindowRef.current) return;

      let newX = prev.x + prev.xSpeed;
      let newY = prev.y + prev.ySpeed;

      if (!playerRef.current) {
        console.log("No player object");
        return prev;
      }

      if (newX >= gameWindowRef.current.offsetWidth - 10 || newX <= 0) {
        prev.xSpeed = -prev.xSpeed;
      }

      if (newY >= gameWindowRef.current.offsetHeight - 20) {
        setGameStatus("over");
        return prev;
      }

      if (gameStatus === "over") return;

      if (
        !collisionDetected.current &&
        newX + prev.size >= playerRef.current.x &&
        newX <= playerRef.current.x + playerRef.current.width &&
        newY + prev.size >= playerRef.current.y &&
        newY <= playerRef.current.y + playerRef.current.height
      ) {
        collisionDetected.current = true;
        score.current += 1;
      } else if (
        newX + prev.size < playerRef.current.x ||
        newX > playerRef.current.x + playerRef.current.width ||
        newY + prev.size < playerRef.current.y ||
        newY > playerRef.current.y + playerRef.current.height
      ) {
        collisionDetected.current = false;
      }

      if (collisionDetected.current) {
        return {
          x: Math.random() * gameWindowRef.current.offsetWidth,
          y: 10,
          xSpeed:
            prev.xSpeed < 0
              ? prev.xSpeed - prev.xAcceleration
              : prev.xSpeed +
                prev.xAcceleration * (Math.random() * 2 > 1 ? 1 : -1),
          ySpeed: prev.ySpeed + prev.yAcceleration,
          yAcceleration: prev.yAcceleration + 0.01,
          xAcceleration: prev.xAcceleration + 0.01,
          size: prev.size,
        };
      } else {
        return {
          x: newX,
          y: newY,
          xSpeed: prev.xSpeed,
          ySpeed: prev.ySpeed,
          yAcceleration: prev.yAcceleration,
          xAcceleration: prev.xAcceleration,
          size: prev.size,
        };
      }
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    document.addEventListener("mousemove", (e) => {
      setPlayerObject((prev) => {
        if (!prev) return prev;
        let newX = e.clientX - 150;

        if (!gameWindowRef.current) return prev;

        if (newX > gameWindowRef.current?.offsetWidth - 85)
          newX = gameWindowRef.current?.offsetWidth - 85;

        if (newX < 0) newX = 0;

        return {
          x: newX,
          y: prev.y,
          height: prev.height,
          width: prev.width,
        };
      });
    });
  }, []);

  useEffect(() => {
    if (!gameWindowRef.current) return;

    if (gameStatus !== "playing") return;

    setPlayerObject({
      x: 0,
      y: gameWindowRef.current.offsetHeight - 80,
      height: 90,
      width: 80,
    });

    setGameObject({
      x: gameWindowRef.current.offsetWidth / 2,
      y: 10,
      xSpeed: 2 * (Math.random() * 2 > 1 ? 1 : -1),
      ySpeed: 2,
      yAcceleration: 1.05,
      xAcceleration: 1.05,
      size: 20,
    });

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameStatus]);

  useEffect(() => {
    playerRef.current = playerObject;
  }, [playerObject]);

  return (
    <div
      className={`absolute h-[60%] md:h-[70%] animate-open w-[75%] -top-20 left-5 bottom-16 my-auto`}
      style={{ zIndex: focusedWindow === "game" ? 30 : 20 }}
    >
      <div
        ref={gameWindowRef}
        className="flex flex-col h-full justify-center items-center relative border-2 rounded bg-black"
      >
        <button
          onClick={() => setFocusedWindow("map")}
          className="absolute cursor-default z-30 inset-0"
        ></button>
        <button
          onClick={() => {
            setOpenGame(false);
            return () => {
              document.removeEventListener("mousemove", (e) => {
                setPlayerObject((prev) => {
                  if (!prev) return prev;
                  let newX = e.clientX - 150;

                  if (!gameWindowRef.current) return prev;

                  if (newX > gameWindowRef.current?.offsetWidth - 85)
                    newX = gameWindowRef.current?.offsetWidth - 85;

                  if (newX < 0) newX = 0;

                  return {
                    x: newX,
                    y: prev.y,
                    height: prev.height,
                    width: prev.width,
                  };
                });
              });
            };
          }}
          className="bg-red-500 rounded-full h-4 aspect-square flex justify-center items-center z-40 absolute top-1 left-1"
        >
          <Icon path={mdiClose} className="h-3 text-black" />
        </button>
        <div className="items-center absolute z-20 w-full space-x-2 flex top-0 left-0 h-6 p-1 right-0 bg-gradient-to-r from-[#c9daff] via-[#eeeeee] to-[#c9daff]">
          <p className="text-white pl-6 text-sm drop-shadow font-bold">
            Paingelz Game
          </p>
        </div>
        <div className="absolute top-10 right-10">
          <p>Score: {score.current}</p>
        </div>
        {gameStatus === "paused" && (
          <button
            onClick={() => setGameStatus("playing")}
            className="absolute z-30 inset-0 bg-black bg-opacity-70 flex justify-center items-center"
          >
            <p className="text-white text-2xl">Play</p>
          </button>
        )}
        {gameStatus === "over" && (
          <div className="absolute z-30 bg-black bg-opacity-70 inset-0 flex flex-col justify-center items-center">
            <p className="text-white pb-4 text-2xl">Game Over</p>
            <p className="text-white pb-4 text-2xl">Score: {score.current}</p>
            <button
              className="p-2 px-4 border"
              onClick={() => {
                score.current = 0;
                setGameStatus("playing");
              }}
            >
              Play Again
            </button>
          </div>
        )}
        {gameObject && (
          <img
            src="/star.png"
            className="absolute"
            style={{
              top: gameObject.y + "px",
              left: gameObject.x + "px",
              height: gameObject.size + "px",
              width: gameObject.size + "px",
            }}
          ></img>
        )}
        {playerObject && (
          <img
            className="absolute"
            src="/player.png"
            style={{
              top: playerObject.y + "px",
              left: playerObject.x + "px",
              height: playerObject.height + "px",
              width: playerObject.width + "px",
            }}
          ></img>
        )}
      </div>
    </div>
  );
};

const PersonalityIcon = ({
  setOpenPersonalityTest,
  setFocusedWindow,
}: {
  setOpenPersonalityTest: Dispatch<SetStateAction<boolean>>;
  setFocusedWindow: Dispatch<
    SetStateAction<"mint" | "map" | "game" | "personality">
  >;
}) => {
  const openWindow = () => {
    setOpenPersonalityTest(true);
    setFocusedWindow("personality");
  };

  return (
    <button
      onClick={openWindow}
      className="h-20 w-20 flex items-center justify-center flex-col"
    >
      <Image
        src="/brain.png"
        width={100}
        height={100}
        alt="personalityicon"
        className="w-10 h-10"
      />
      <p className="text-sm drop-shadow text-center">Personality Test</p>
    </button>
  );
};

// personality test
const questions = [
  {
    question: "What is your favorite color?",
    answers: [
      { answer: "Red", value: "Infernal" },
      { answer: "Blue", value: "Seraphin" },
      { answer: "Green", value: "Pridwin" },
      { answer: "Yellow", value: "Cascadiel" },
      { answer: "Purple", value: "Ghastiel" },
      { answer: "Pink", value: "Cherublossom" },
    ],
  },
  {
    question: "What is your favorite element?",
    answers: [
      { answer: "Fire", value: "Infernal" },
      { answer: "Water", value: "Cascadiel" },
      { answer: "Air", value: "Pridwin" },
      { answer: "Earth", value: "Ghastiel" },
      { answer: "Light", value: "Seraphin" },
      { answer: "Darkness", value: "Ghastiel" },
    ],
  },
  {
    question: "What is your favorite season?",
    answers: [
      { answer: "Summer", value: "Infernal" },
      { answer: "Winter", value: "Ghastiel" },
      { answer: "Spring", value: "Cherublossom" },
      { answer: "Autumn", value: "Pridwin" },
      { answer: "Rainy", value: "Cascadiel" },
      { answer: "Sunny", value: "Seraphin" },
    ],
  },
  {
    question: "What is your favorite animal?",
    answers: [
      { answer: "Dragon", value: "Infernal" },
      { answer: "Dolphin", value: "Cascadiel" },
      { answer: "Wolf", value: "Pridwin" },
      { answer: "Owl", value: "Ghastiel" },
      { answer: "Unicorn", value: "Cherublossom" },
      { answer: "Pegasus", value: "Seraphin" },
    ],
  },
  {
    question: "What is your favorite hobby?",
    answers: [
      { answer: "Reading", value: "Seraphin" },
      { answer: "Swimming", value: "Cascadiel" },
      { answer: "Hiking", value: "Pridwin" },
      { answer: "Stargazing", value: "Ghastiel" },
      { answer: "Gardening", value: "Cherublossom" },
      { answer: "Painting", value: "Infernal" },
    ],
  },
];

const PersonalityTestWindow = ({
  setOpenPersonalityTest,
  setFocusedWindow,
  focusedWindow,
}: {
  setOpenPersonalityTest: Dispatch<SetStateAction<boolean>>;
  setFocusedWindow: Dispatch<
    SetStateAction<"mint" | "map" | "game" | "personality">
  >;
  focusedWindow: "mint" | "map" | "game" | "personality";
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({
    Infernal: 0,
    Seraphin: 0,
    Pridwin: 0,
    Cascadiel: 0,
    Ghastiel: 0,
    Cherublossom: 0,
  });
  const [maxKey, setMaxKey] = useState<string>("");

  const getMaxKey = () => {
    let max = 0;
    let maxKey = "";
    for (const key in answers) {
      if (answers[key] > max) {
        max = answers[key];
        maxKey = key;
      }
    }

    setMaxKey(maxKey);
  };

  const nextQuestion = (value: string) => {
    setAnswers((prev) => {
      return {
        ...prev,
        [value]: prev[value] + 1,
      };
    });

    if (currentQuestion === questions.length - 1) {
      getMaxKey();
      return;
    }

    setCurrentQuestion((prev) => prev + 1);
  };

  return (
    <div
      className={`absolute text-[#dedede] flex flex-col border-2 rounded h-[60%] md:h-[70%] animate-open w-[75%] -top-10 right-5 bottom-16 my-auto`}
      style={{ zIndex: focusedWindow === "personality" ? 30 : 20 }}
    >
      <div className="absolute space-x-2 items-center flex z-30 top-0 w-full h-6 p-1 bg-gradient-to-r from-[#cea6d4] via-[#dddddd] to-[#cea6d4]">
        <button
          onClick={() => setOpenPersonalityTest(false)}
          className="bg-red-500 rounded-full h-4 w-4 flex justify-center items-center"
        >
          <Icon path={mdiClose} className="h-3 text-black" />
        </button>
        <p className="text-sm text-white drop-shadow font-bold">
          Paingelz Personality Test
        </p>
      </div>
      <div
        onClick={() => setFocusedWindow("personality")}
        className="flex h-full pt-10 relative overflow-y-scroll flex-col bg-black"
      >
        <h2 className="text-2xl text-center font-bold">
          Paingelz Personality Test
        </h2>
        <div className="flex justify-center items-center">
          <Image
            src="/brain.png"
            className="w-1/2 max-w-[200px]"
            width={300}
            height={300}
            alt="brain"
          />
        </div>
        <div className="p-4 pt-0 space-y-2">
          <p className="text-center">{questions[currentQuestion].question}</p>
          <div className="grid grid-cols-2 w-full gap-2">
            {questions[currentQuestion].answers.map((answer, i) => {
              return (
                <button
                  key={i}
                  onClick={() => nextQuestion(answer.value)}
                  className="p-2 border"
                >
                  {answer.answer}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {maxKey && (
        <div className="border flex-col space-y-2 absolute inset-0 z-20 flex justify-center items-center bg-black/80">
          <p>Result:</p>
          <p className="text-2xl font-bold pb-4">{maxKey}</p>
          <button
            onClick={() => {
              setMaxKey("");
              setCurrentQuestion(0);
            }}
            className="p-2 px-4 border"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

// random generator when minted.
