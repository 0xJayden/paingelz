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
  const [focusedWindow, setFocusedWindow] = useState<"mint" | "map">("mint");

  const requestRef = useRef<number>(0);

  const animate = () => {
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
    for (let i = 0; i < 50; i++) {
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
              <div
                key={i}
                id="dot"
                style={{
                  top: dot.y + "px",
                  left: dot.x + "px",
                  backgroundColor: dot.color,
                  height: dot.size + "px",
                  width: dot.size + "px",
                }}
                className={`absolute rounded-full z-50`}
              ></div>
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
          <BottomNavbar
            setOpenMint={setOpenMint}
            openMint={openMint}
            setOpenMap={setOpenMap}
            openMap={openMap}
            setFocusedWindow={setFocusedWindow}
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
  setFocusedWindow: Dispatch<SetStateAction<"mint" | "map">>;
  focusedWindow: "mint" | "map";
}) => {
  const [dots, setDots] = useState<Array<Dot>>([]);
  const [price, setPrice] = useState<number>();

  const dotContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  const wallet = useWallet();

  const umi = createUmi("https://api.devnet.solana.com")
    .use(walletAdapterIdentity(wallet))
    .use(mplCandyMachine())
    .use(mplTokenMetadata());

  const animate = () => {
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
          className="absolute z-30 inset-0"
        ></button>
        <button
          onClick={() => setOpenMint(false)}
          className="bg-red-500 rounded-full h-4 aspect-square flex justify-center items-center z-40 absolute top-1 left-1"
        >
          <Icon path={mdiClose} className="h-3 text-black" />
        </button>
        <div className="items-center absolute z-20 w-full space-x-2 flex top-0 left-0 h-6 p-1 right-0 bg-gradient-to-r from-[#ffffc9] via-[#eeeeee] to-[#ffffc9]">
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
            <div
              key={i}
              id="dot"
              style={{
                top: dot.y + "px",
                left: dot.x + "px",
                // backgroundColor: dot.color,
                color: dot.color,
                height: dot.size + "px",
                width: dot.size + "px",
              }}
              className={`absolute opacity-70 rounded-full`}
            >
              *
            </div>
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
}: {
  setOpenMint: Dispatch<SetStateAction<boolean>>;
  openMint: boolean;
  setOpenMap: Dispatch<SetStateAction<boolean>>;
  openMap: boolean;
  setFocusedWindow: Dispatch<SetStateAction<"mint" | "map">>;
}) => {
  return (
    <div className="absolute space-y-4 p-4 inset-0 z-10">
      <MintIcon
        setOpenMint={setOpenMint}
        openMint={openMint}
        setFocusedWindow={setFocusedWindow}
      />
      <MapIcon
        setOpenMap={setOpenMap}
        openMap={openMap}
        setFocusedWindow={setFocusedWindow}
      />
    </div>
  );
};

const MintIcon = ({
  setOpenMint,
  openMint,
  setFocusedWindow,
}: {
  setOpenMint: Dispatch<SetStateAction<boolean>>;
  openMint: boolean;
  setFocusedWindow: Dispatch<SetStateAction<"mint" | "map">>;
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
  openMap,
  setFocusedWindow,
}: {
  setOpenMap: Dispatch<SetStateAction<boolean>>;
  openMap: boolean;
  setFocusedWindow: Dispatch<SetStateAction<"mint" | "map">>;
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

const BottomNavbar = ({
  setOpenMint,
  openMint,
  setOpenMap,
  openMap,
  setFocusedWindow,
}: {
  setOpenMint: Dispatch<SetStateAction<boolean>>;
  openMint: boolean;
  setOpenMap: Dispatch<SetStateAction<boolean>>;
  openMap: boolean;
  setFocusedWindow: Dispatch<SetStateAction<"mint" | "map">>;
}) => {
  const openWindow = (window: "mint" | "map") => {
    if (window === "mint") {
      setOpenMint(!openMint);
      setFocusedWindow("mint");
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
          className="flex flex-col items-center space-y-1 rounded-full"
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
      </div>
    </div>
  );
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
      requestRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(requestRef.current);
    }, 4800);
  }, []);

  const animate = () => {
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

  const openGates = () => {
    setOpenSplash(false);
    setPlaying(true);
    setTimeout(() => {
      setOpenMint(true);
    }, 2000);
  };

  return (
    <div className="w-full relative h-screen pb-20 md:justify-start flex flex-col space-y-2 items-center justify-center bg-black">
      {dots.map((dot, i) => {
        return (
          <div
            key={i}
            id="dot"
            style={{
              top: dot.y + "px",
              left: dot.x + "px",
              backgroundColor: dot.color,
              height: dot.size + "px",
              width: dot.size + "px",
            }}
            className={`absolute rounded-full`}
          ></div>
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
  setFocusedWindow: Dispatch<SetStateAction<"mint" | "map">>;
  focusedWindow: "mint" | "map";
}) => {
  return (
    <div
      className={`absolute sm:h-[50%] lg:h-[60%] h-[380px] animate-open w-[75%] top-0 ml-16 bottom-16 my-auto`}
      style={{ zIndex: focusedWindow === "map" ? 30 : 20 }}
    >
      <div className="flex flex-col h-full justify-center items-center relative border-2 rounded bg-black">
        <button
          onClick={() => setFocusedWindow("map")}
          className="absolute z-30 inset-0"
        ></button>
        <button
          onClick={() => setOpenMap(false)}
          className="bg-red-500 rounded-full h-4 aspect-square flex justify-center items-center z-40 absolute top-1 left-1"
        >
          <Icon path={mdiClose} className="h-3 text-black" />
        </button>
        <div className="items-center absolute z-20 w-full space-x-2 flex top-0 left-0 h-6 p-1 right-0 bg-gradient-to-r from-[#c9daff] via-[#eeeeee] to-[#c9daff]">
          <p className="text-white pl-6 text-sm drop-shadow font-bold">
            Paingelz World
          </p>
        </div>
        <h2 className="text-2xl font-bold">Painglez World</h2>
        <div className="relative z-20 max-w-[1400px] w-full">
          <video
            className="h-full w-full"
            src="/mapvid.mp4"
            muted
            autoPlay
            loop
            playsInline
          />
        </div>
      </div>
    </div>
  );
};
