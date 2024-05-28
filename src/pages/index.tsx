import Image from "next/image";
import { Inter } from "next/font/google";
import Icon from "@mdi/react";
import {
  mdiArrowRight,
  mdiClose,
  mdiContentCopy,
  mdiStar,
  mdiTrophy,
  mdiVolumeHigh,
  mdiVolumeMute,
} from "@mdi/js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import Head from "next/head";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { Connection } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import Link from "next/link";
import { Windows } from "@/types";
import ChatWindow from "@/components/Chat";
import { BottomNavbar } from "@/components/BottomNavbar";
import { IconContainer } from "@/components/IconContainer";
import Radio from "@/components/Radio";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [dots, setDots] = useState<Array<Dot>>([]);
  const [openSplash, setOpenSplash] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement>();
  const [playing, setPlaying] = useState(false);
  const [focusedWindow, setFocusedWindow] = useState<Windows>("mint");
  const [windows, setWindows] = useState<Windows[]>([]);

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

  const playOrPause = () => {
    if (audio) {
      if (playing) {
        audio.pause();
      } else {
        audio.play();
      }
      setPlaying(!playing);
    }
  };

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
          playOrPause={playOrPause}
          setWindows={setWindows}
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
          <div className="absolute bottom-16">
            <Image
              src={"/paingelzlogo.png"}
              width={400}
              height={400}
              alt="paingelzlogo"
            />
          </div>
          <Radio setAudio={setAudio} audio={audio} />
          <button className="absolute z-50 top-1 right-1" onClick={playOrPause}>
            <Icon
              path={playing ? mdiVolumeMute : mdiVolumeHigh}
              className="h-5"
            />
          </button>
          <IconContainer
            setWindows={setWindows}
            setFocusedWindow={setFocusedWindow}
          />
          {windows.includes("mint") && (
            <MintWindow
              setWindows={setWindows}
              setFocusedWindow={setFocusedWindow}
              focusedWindow={focusedWindow}
            />
          )}
          {windows.includes("map") && (
            <MapWindow
              setWindows={setWindows}
              setFocusedWindow={setFocusedWindow}
              focusedWindow={focusedWindow}
            />
          )}
          {windows.includes("game") && (
            <GameWindow
              setWindows={setWindows}
              setFocusedWindow={setFocusedWindow}
              focusedWindow={focusedWindow}
            />
          )}
          {windows.includes("personality") && (
            <PersonalityTestWindow
              setWindows={setWindows}
              setFocusedWindow={setFocusedWindow}
              focusedWindow={focusedWindow}
            />
          )}
          {windows.includes("collection") && (
            <CollectionWindow
              setWindows={setWindows}
              setFocusedWindow={setFocusedWindow}
              focusedWindow={focusedWindow}
            />
          )}
          {windows.includes("artist") && (
            <ArtistWindow
              setWindows={setWindows}
              setFocusedWindow={setFocusedWindow}
              focusedWindow={focusedWindow}
            />
          )}
          {windows.includes("socials") && (
            <SocialsWindow
              setWindows={setWindows}
              setFocusedWindow={setFocusedWindow}
              focusedWindow={focusedWindow}
            />
          )}
          {windows.includes("chat") && (
            <ChatWindow
              setWindows={setWindows}
              setFocusedWindow={setFocusedWindow}
              focusedWindow={focusedWindow}
            />
          )}
          <BottomNavbar
            setWindows={setWindows}
            setFocusedWindow={setFocusedWindow}
            windows={windows}
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
};

export const colors = ["red", "blue", "green", "pink", "stars", "gray"];

const MintWindow = ({
  setWindows,
  setFocusedWindow,
  focusedWindow,
}: {
  setWindows: Dispatch<SetStateAction<Windows[]>>;
  setFocusedWindow: Dispatch<SetStateAction<Windows>>;
  focusedWindow: Windows;
}) => {
  const [dots, setDots] = useState<Array<Dot>>([]);
  const [clouds, setClouds] = useState<Array<Cloud>>([]);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [mintAmount, setMintAmount] = useState<number | null>(1);

  const dotContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const priceRef = useRef<number>(0);
  const itemsLeftRef = useRef<number>(0);
  const txhashRef = useRef<string[]>([]);

  const wallet = useWallet();

  const umi = createUmi(process.env.NEXT_PUBLIC_ENDPOINT as string)
    .use(walletAdapterIdentity(wallet))
    // .use(mplCandyMachine())
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

        if (
          !dotContainerRef.current?.offsetWidth ||
          !dotContainerRef.current?.offsetHeight
        )
          return dot;

        if (newX >= dotContainerRef.current.offsetWidth - 10 || newX <= 0) {
          dot.xSpeed = -dot.xSpeed;
        }

        if (newY >= dotContainerRef.current.offsetHeight - 20 || newY <= 10) {
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
        };
      });
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // getNftInfo();
    generateDots();
    generateClouds();
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const generateDots = () => {
    const newDots: Dot[] = [];
    for (let i = 0; i < 25; i++) {
      if (!dotContainerRef.current) return;
      newDots.push({
        x: Math.random() * dotContainerRef.current.offsetWidth - 10,
        y: Math.random() * dotContainerRef.current.offsetHeight - 20,
        xSpeed: Math.random() * 2,
        ySpeed: Math.random() * 2,
        yAcceleration: 1.01,
        size: 2,
      });
    }
    setDots(newDots);
  };

  const generateClouds = () => {
    const clouds: Cloud[] = [];
    for (let i = 0; i < 25; i++) {
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      txhashRef.current.map((txid) => txid).join(", ")
    );
    setCopySuccess(true);
  };

  return (
    <div
      className={`absolute animate-open top-[100px] h-[70%] overflow-hidden right-2 my-auto w-[75%] text-[#00eeee]`}
      style={{ zIndex: focusedWindow === "mint" ? 30 : 20 }}
    >
      <button
        onClick={() => setFocusedWindow("mint")}
        className="absolute z-50 inset-0 cursor-default"
      ></button>
      <button
        onClick={() => setWindows((prev) => prev.filter((w) => w !== "mint"))}
        className="bg-red-500 rounded-full h-4 aspect-square flex justify-center items-center z-[70] absolute top-1 left-1"
      >
        <Icon path={mdiClose} className="h-3 text-black" />
      </button>
      <div className="items-center rounded-t absolute z-[60] w-full space-x-2 flex top-0 left-0 h-6 p-1 right-0 bg-gradient-to-r from-[#c4c49a] via-[#eeeeee] to-[#c4c49a]">
        <p className="text-white pl-6 text-sm drop-shadow font-bold">
          Paingelz Mint
        </p>
      </div>
      <div
        ref={dotContainerRef}
        className="flex overflow-y-scroll z-50 flex-col h-full relative border-2 rounded bg-black"
      >
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
        <div className="flex z-30 text-center flex-col justify-center p-2 space-y-1">
          <Link
            className="p-1 border flex items-center justify-center space-x-1 border-[#f0fa6f] text-[#f0fa6f]"
            href={"https://rewards.paingelz.com"}
          >
            <Icon path={mdiStar} className="h-4" />
            <p className="text-sm">Claim Popcat</p>
            <Icon path={mdiStar} className="h-4" />
          </Link>
          <p>Find Paingelz at</p>
        </div>
        <div className="space-x-2 justify-center z-30 pb-2 flex">
          <Link
            className="p-1 flex items-center space-x-1 border text-white "
            href={"https://www.tensor.trade/trade/paingelz"}
          >
            <p className="text-sm">Tensor</p>
            <Icon path={mdiArrowRight} className="h-4" />
          </Link>
          <Link
            className="p-1 border border-[#ee00ee] flex items-center space-x-1 text-[#ee00ee]"
            href={"https://magiceden.io/marketplace/paingelz_"}
          >
            <p className="text-sm">Magic Eden</p>
            <Icon path={mdiArrowRight} className="h-4" />
          </Link>
        </div>
        <div className="flex flex-col space-y-2 justify-center items-center">
          <p>Join the community</p>
          <Link
            className="p-1 flex space-x-1 items-center border text-center border-[#00eeee] "
            href={"https://t.me/paingelzportal"}
          >
            <p className="text-sm">Telegram</p>
            <Icon path={mdiArrowRight} className="h-4" />
          </Link>
        </div>
        <p className="text-xs leading-3 p-2 text-white/30">{`Paingelz is an art project with no intrinsic value or expectation of financial return. Paingelz is completely useless and for entertainment purposes only. When you purchase Paingelz, you are agreeing that you have seen this disclaimer.`}</p>
        {dots.map((dot, i) => (
          <img
            key={i}
            src="/star.png"
            style={{ top: dot.y + "px", left: dot.x + "px" }}
            className="w-3 h-3 absolute"
          />
        ))}
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
      {success && (
        <div className="absolute animate-fadeUp z-[80] inset-0 flex justify-center items-center">
          <div className="bg-black relative text-center space-y-4 bg-opacity-70 p-4 rounded-lg">
            <button
              onClick={() => {
                setSuccess(false);
                setCopySuccess(false);
              }}
              className="absolute top-2 left-2"
            >
              <Icon path={mdiClose} className="h-5 text-red-500" />
            </button>
            <p className="text-green-500 text-2xl">NFT Minted!</p>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-1"
            >
              <Icon path={mdiContentCopy} className="h-5" />
              <p>Copy Transaction Hash</p>
            </button>
            {copySuccess && (
              <p className="text-green-500 text-sm">Copied to clipboard!</p>
            )}
          </div>
        </div>
      )}
      {errorMessage && (
        <div className="absolute animate-fadeUp z-[80] inset-0 flex justify-center items-center">
          <div className="bg-black relative text-center space-y-4 bg-opacity-70 p-4 rounded-lg">
            <button
              onClick={() => setErrorMessage("")}
              className="absolute top-2 left-2"
            >
              <Icon path={mdiClose} className="h-5 text-red-500" />
            </button>
            <p className="text-red-500 text-2xl">{errorMessage}</p>
            <WalletMultiButton />
          </div>
        </div>
      )}
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
  playOrPause,
  setWindows,
}: {
  setOpenSplash: Dispatch<SetStateAction<boolean>>;
  playOrPause: () => void;
  setWindows: Dispatch<SetStateAction<Windows[]>>;
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

        if (newX > window.innerWidth) {
          newX = -cloud.size;
          newY = Math.random() * window.innerHeight;
        }
        if (newX < 0 - cloud.size) {
          newX = window.innerWidth;
          newY = Math.random() * window.innerHeight;
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
    playOrPause();
    setTimeout(() => {
      setWindows(["mint"]);
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
      {dots.map((dot, i) => (
        <img
          key={i}
          src="/star.png"
          style={{ top: dot.y + "px", left: dot.x + "px" }}
          className="w-5 h-5 absolute z-50"
        />
      ))}
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
  setWindows,
  setFocusedWindow,
  focusedWindow,
}: {
  setWindows: Dispatch<SetStateAction<Windows[]>>;
  setFocusedWindow: Dispatch<SetStateAction<Windows>>;
  focusedWindow: Windows;
}) => {
  return (
    <div
      className={`absolute text-[#dedede] flex flex-col border-2 rounded h-[60%] md:h-[70%] animate-open w-[75%] -top-12 right-6 bottom-10 my-auto`}
      style={{ zIndex: focusedWindow === "map" ? 30 : 20 }}
    >
      <div className="absolute space-x-2 items-center flex z-30 top-0 w-full h-6 p-1 bg-gradient-to-r from-[#a6b5d4] via-[#dddddd] to-[#a6b5d4]">
        <button
          onClick={() => setWindows((prev) => prev.filter((w) => w !== "map"))}
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
          <p className="font-bold pt-2">{`1. **Seraphin Kingdom**: (Star Ones)`}</p>
          <p className="text-sm">{`Symbolizing purity and transcendence, Seraphins hails from the gleaming city of Lumina, situated atop the highest peak in Etherealia. Its members possess ethereal beauty and radiant powers, revered as the epitome of angelic grace. They serve as guardians of the realm, their luminescent presence warding off the malevolent forces of House Red. Seraphins kingdoms leader, the archangel Lumiel, is revered as the paragon of virtue and wisdom.`}</p>
          <p className="font-semibold text-center">Leader of star paingelz</p>
          <div className="flex justify-center items-center">
            <Image
              src={"/star1o1.jpg"}
              width={200}
              height={200}
              alt="star 1 of 1"
            />
          </div>
          <p className="text-sm">{`Lumiel - an arcangel often looked at the divine leader of the entire paingelz existence (most valuable paingel)`}</p>
          <p className="font-bold pt-2">{`2. **Infernals**: (Red)`}</p>
          <p className="text-sm">{`Emerging from the fiery depths of Infernia, the city of brimstone and despair, Los diablos embodies darkness and temptation. Its denizens, known as the infernals, wield formidable powers fueled by malice and ambition. Led by the enigmatic Fallen Seraph, Malphas, they seek to spread chaos and corruption throughout Etherealia, locked in eternal conflict with the forces of light.`}</p>
          <p className="font-semibold text-center">Leader of red paingelz</p>
          <div className="flex justify-center items-center">
            <Image
              src={"/red1o1.jpg"}
              width={200}
              height={200}
              alt="red 1 of 1"
            />
          </div>
          <p className="text-sm">{`Malphas - formerly a seraphin top Angel who has fallen and seeks to cause corruption and evil through out etherelia`}</p>
          <p className="font-bold pt-2">{`3. **Cascadiel Kingdom**: (Blue)`}</p>
          <p className="text-sm">{`Nestled beneath the ocean's depths lies the city of Aquatica, home to Cascadiels. These aquatic angels harness the power of the sea, commanding mighty waves and currents. They are adept at navigating both the tranquil depths and treacherous waters, often serving as ambassadors between Etherealia and other realms. Despite their serene appearance, Cascadiels harbors a deep-seated rivalry with House Grey, stemming from ancient conflicts over territorial boundaries.`}</p>
          <p className="font-semibold text-center">Leader of blue paingelz</p>
          <div className="flex justify-center items-center">
            <Image
              src={"/blue1o1.jpg"}
              width={200}
              height={200}
              alt="blue 1 of 1"
            />
          </div>
          <p className="text-sm">{`Marithiel- ruler of the sea and everything under it marithiel is controversial for his beef with the gray paingelz`}</p>
          <p className="font-bold pt-2">{`4. **Ghastiel Kingdom**: (Gray)`}</p>
          <p className="text-sm">{`Dwelling within the mist-shrouded city of Spectra, Ghastiels comprises spectral beings who straddle the line between the corporeal and the ethereal. Ghostly in appearance, they possess the ability to traverse the realms of the living and the dead, serving as guides for lost souls. Despite their neutrality, Ghastiels often finds themselves caught in the crossfire of the celestial conflict, their ethereal city serving as a battleground for opposing forces.`}</p>
          <p className="font-semibold text-center">Leader of gray paingelz</p>
          <div className="flex justify-center items-center">
            <Image
              src={"/gray1o1.jpg"}
              width={200}
              height={200}
              alt="gray 1 of 1"
            />
          </div>
          <p className="text-sm">{`Casper - the leader of guiding lost souls and helping them often Casper has conflict with marithiel`}</p>
          <p className="font-bold pt-2">{`5. **Cherublossom Realm**: (Pink)`}</p>
          <p className="text-sm">{`Radiating with compassion and healing energy, Cherrublossoms call the blossoming city of Elysium home. Its members are adept healers and nurturers, possessing the ability to mend both body and spirit. They are known for their unwavering empathy and kindness, often extending their aid to those in need. Despite their benevolent nature, cherrublossoms faces disdain from some members of House Green, who view their pacifism as a sign of weakness.`}</p>
          <p className="font-semibold text-center">Leader of pink paingelz</p>
          <div className="flex justify-center items-center">
            <Image
              src={"/pink1o1.jpg"}
              width={200}
              height={200}
              alt="pink 1 of 1"
            />
          </div>
          <p className="text-sm">{`Roselith - the only female leader in the paingelz kingdom etherelia she leads with love and light first often being mistaken for kindness and prone for attack from other kingdoms`}</p>
          <p className="font-bold pt-2">{`6. **Pridwin kingdom**: (Green)`}</p>
          <p className="text-sm">{`Hailing from the verdant city of Sylvanis, Pridwins embodies cunning and resourcefulness. These stealthy angels are skilled in the arts of espionage and subterfuge, often operating in the shadows to gather intelligence and thwart their enemies' plans. While they possess a strong sense of loyalty to their allies, Pridwins ambition sometimes leads them into conflict with other houses, particularly Cherrublossom, whom they perceive as naive and vulnerable.`}</p>
          <p className="font-semibold text-center">Leader of green paingelz</p>
          <div className="flex justify-center items-center">
            <Image
              src={"/green1o1.jpg"}
              width={200}
              height={200}
              alt="green 1 of 1"
            />
          </div>
          <p className="text-sm">{`Grimleaf - not to be trusted grimleaf who rules in the Forrest is often plotting and scheming for his next attack. Him and his paingelz are very dangerous`}</p>
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

const ColorPicker = ({
  setColor,
  color,
}: {
  setColor: Dispatch<SetStateAction<string>>;
  color: string;
}) => {
  return (
    <>
      <p>Current Color</p>
      <img src={`/${color}Paingel.png`} className="w-20 h-20" />
      <p>Select Color</p>
      <div className="grid gap-2 grid-cols-3">
        {colors.map((color, i) => (
          <button
            key={i}
            onClick={() => setColor(color)}
            style={{
              backgroundColor:
                color === "stars"
                  ? "yellow"
                  : color !== "blue"
                  ? color
                  : "cyan",
            }}
            className="h-10 w-10 rounded-full"
          ></button>
        ))}
      </div>
    </>
  );
};

const HighScores = ({
  setOpenHighScores,
  highScores,
}: {
  setOpenHighScores: Dispatch<SetStateAction<boolean>>;
  highScores: any[];
}) => {
  return (
    <div className="absolute space-y-2 overflow-y-scroll sm:space-y-4 inset-0 items-center z-[60] flex p-2 bg-black flex-col">
      <button className="self-start" onClick={() => setOpenHighScores(false)}>
        <Icon path={mdiClose} className="h-5" />
      </button>
      <h1 className="text-center">High Scores</h1>
      {highScores.map((score, i) => (
        <div key={i} className="flex max-w-[700px] w-full justify-between">
          <div className="flex items-center space-x-1">
            <p
              style={{
                color:
                  i === 0
                    ? "gold"
                    : i === 1
                    ? "silver"
                    : i === 2
                    ? "brown"
                    : "white",
              }}
            >
              {i + 1}.
            </p>
            <p>{score.name}</p>
          </div>
          <p>{score.score}</p>
        </div>
      ))}
    </div>
  );
};

const GameWindow = ({
  setWindows,
  setFocusedWindow,
  focusedWindow,
}: {
  setWindows: Dispatch<SetStateAction<Windows[]>>;
  setFocusedWindow: Dispatch<SetStateAction<Windows>>;
  focusedWindow: Windows;
}) => {
  const [gameObject, setGameObject] = useState<GameObject>();
  const [playerObject, setPlayerObject] = useState<PlayerObject>();
  const [gameStatus, setGameStatus] = useState<"playing" | "paused" | "over">(
    "paused"
  );
  const [color, setColor] = useState(
    colors[Math.floor(Math.random() * colors.length)]
  );
  const [name, setName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openScores, setOpenScores] = useState(false);
  const [gotHighScore, setGotHighScore] = useState(false);
  const [highScores, setHighScores] = useState<any[]>([]);

  const requestRef = useRef<number>(0);
  const gameWindowRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerObject>();
  const score = useRef<number>(0);
  const collisionDetected = useRef<boolean>(false);

  const gameOver = () => {
    setGameStatus("over");
    const isHighScore =
      highScores.filter((s) => +s.score < score.current).length > 0;
    setGotHighScore(isHighScore);
  };

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
        gameOver();
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/postScore", {
        method: "POST",
        body: JSON.stringify({ name, score: score.current }),
      });

      const data = await res.json();
      setSuccessMessage(data.msg);
      setGotHighScore(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Error submitting score");
      console.error(`Error submitting score: ${error}`);
    }
  };

  useEffect(() => {
    fetch("/api/checkHighScores")
      .then((res) => res.json())
      .then((data) => {
        setHighScores(data.data);
      });

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
      className={`absolute h-[65%] md:h-[70%] animate-open w-[75%] -top-20 left-5 bottom-16 my-auto`}
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
            setWindows((prev) => prev.filter((w) => w !== "game"));
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
        <div className="absolute top-10 right-1">
          <p>Score: {score.current}</p>
        </div>
        <button
          onClick={() => setOpenScores(!openScores)}
          className="absolute z-50 p-1 top-10 left-1"
        >
          <Icon path={mdiTrophy} className="h-5 text-yellow-500" />
        </button>
        {openScores && (
          <HighScores
            setOpenHighScores={setOpenScores}
            highScores={highScores}
          />
        )}
        {gameStatus === "paused" && (
          <div className="absolute space-y-2 flex-col z-30 inset-0 bg-black bg-opacity-70 flex justify-center items-center">
            <ColorPicker setColor={setColor} color={color} />
            <button
              className="border px-4 p-2"
              onClick={() => setGameStatus("playing")}
            >
              <p className="text-white text-2xl">Play</p>
            </button>
          </div>
        )}
        {gameStatus === "over" && (
          <div className="absolute space-y-2 top-6 sm:justify-center overflow-y-scroll z-30 bg-black bg-opacity-70 inset-0 flex flex-col items-center p-2">
            <p className="text-white sm:text-2xl">Game Over</p>
            <p className="text-white sm:text-2xl">Score: {score.current}</p>
            {gotHighScore && (
              <>
                <p className="text-yellow-500 sm:text-2xl">New High Score!</p>
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center relative"
                >
                  <input
                    placeholder="enter name"
                    className="border p-2 bg-transparent"
                    onChange={(e) => setName(e.target.value)}
                  />
                  <button className="absolute right-1">
                    <Icon path={mdiArrowRight} className="h-5" />
                  </button>
                </form>
              </>
            )}
            <ColorPicker setColor={setColor} color={color} />
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
        {successMessage && (
          <div className="z-[90] p-2 border border-gray-700 animate-fadeUp bg-black/80">
            <p className="text-green-500 text-xl text-center pb-2">
              {successMessage}
            </p>
            <div className="flex flex-col">
              <p>Name: {name}</p>
              <p>Score: {score.current}</p>
            </div>
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
            src={`/${color}Paingel.png`}
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

const questions = [
  {
    question: "Choose your super power.",
    answers: [
      { answer: "Flight", value: "Seraphin", color: "Stars" },
      { answer: "Telekinesis", value: "Infernal", color: "Red" },
      { answer: "Invisibility", value: "Ghastiel", color: "Gray" },
      { answer: "Healing", value: "Cherublossom", color: "Pink" },
      { answer: "Teleportation", value: "Pridwin", color: "Green" },
      { answer: "Time Travel", value: "Cascadiel", color: "Blue" },
    ],
  },
  {
    question: "If you had to pick one, what would it be?",
    answers: [
      { answer: "Money", value: "Pridwin", color: "Green" },
      { answer: "Love", value: "Cherublossom", color: "Pink" },
      { answer: "Power", value: "Infernal", color: "Red" },
      { answer: "Knowledge", value: "Seraphin", color: "Stars" },
      { answer: "Peace", value: "Cascadiel", color: "Blue" },
      { answer: "Death", value: "Ghastiel", color: "Gray" },
    ],
  },
  {
    question: "You end up in heaven. What do you do first?",
    answers: [
      { answer: "Fly with the angels", value: "Seraphin", color: "Stars" },
      { answer: "Kiss God", value: "Cherublossom", color: "Pink" },
      { answer: "Scare everyone", value: "Ghastiel", color: "Gray" },
      { answer: "Visit great grandma", value: "Pridwin", color: "Green" },
      { answer: "Chill", value: "Cascadiel", color: "Blue" },
      { answer: "Plot against God", value: "Infernal", color: "Red" },
    ],
  },
  {
    question:
      "You find yourself stranded on an island with Adam Sandler. What do you do about it?",
    answers: [
      { answer: "Throw him in the sea", value: "Infernal", color: "Red" },
      { answer: "Nothing", value: "Cascadiel", color: "Blue" },
      { answer: "Smoke a blunt", value: "Pridwin", color: "Green" },
      { answer: "Throw yourself in the sea", value: "Ghastiel", color: "Gray" },
      { answer: "Play golf", value: "Seraphin", color: "Stars" },
      { answer: "Flirt", value: "Cherublossom", color: "Pink" },
    ],
  },
  {
    question: "What would you rather be doing right now?",
    answers: [
      { answer: "Getting a tattoo", value: "Ghastiel", color: "Gray" },
      { answer: "Burning stuff", value: "Infernal", color: "Red" },
      { answer: "Partying", value: "Pridwin", color: "Green" },
      { answer: "Sleeping", value: "Cascadiel", color: "Blue" },
      { answer: "Floating in space", value: "Seraphin", color: "Stars" },
      { answer: "Bangin", value: "Cherublossom", color: "Pink" },
    ],
  },
];

const ColorTypes = [
  { type: "Infernal", color: "Red" },
  { type: "Seraphin", color: "Stars" },
  { type: "Pridwin", color: "Green" },
  { type: "Cascadiel", color: "Blue" },
  { type: "Ghastiel", color: "Gray" },
  { type: "Cherublossom", color: "Pink" },
];

const PersonalityTestWindow = ({
  setWindows,
  setFocusedWindow,
  focusedWindow,
}: {
  setWindows: Dispatch<SetStateAction<Windows[]>>;
  setFocusedWindow: Dispatch<SetStateAction<Windows>>;
  focusedWindow: Windows;
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

  const getColorType = () => {
    const color = ColorTypes.find((color) => color.type === maxKey);

    if (!color) return "";

    return color.color;
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
    setTimeout(() => scrollToBottom(), 200);
  };

  const scrollToBottom = () => {
    const scrollTo = document.getElementById("scrollTo");
    if (scrollTo) scrollTo.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className={`absolute text-[#dedede] flex flex-col border-2 rounded h-[60%] md:h-[70%] animate-open w-[75%] -top-10 right-10 bottom-0 my-auto`}
      style={{ zIndex: focusedWindow === "personality" ? 30 : 20 }}
    >
      <div className="absolute space-x-2 items-center flex z-30 top-0 w-full h-6 p-1 bg-gradient-to-r from-[#cea6d4] via-[#dddddd] to-[#cea6d4]">
        <button
          onClick={() =>
            setWindows((prev) => prev.filter((w) => w !== "personality"))
          }
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
        <div id="scrollTo"></div>
      </div>
      {maxKey && (
        <div className="border p-2 flex-col space-y-2 absolute inset-0 z-20 flex justify-center items-center bg-black/80">
          <p className="text-xl text-center">
            You must be the{" "}
            <span className="font-bold">
              {getColorType()} {maxKey}
            </span>{" "}
            Paingel!
          </p>
          <Image
            src={`/${getColorType().toLowerCase()}Paingel.png`}
            width={150}
            height={150}
            alt={maxKey}
          />
          <button
            onClick={() => {
              setMaxKey("");
              setCurrentQuestion(0);
              setAnswers({
                Infernal: 0,
                Seraphin: 0,
                Pridwin: 0,
                Cascadiel: 0,
                Ghastiel: 0,
                Cherublossom: 0,
              });
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

const CollectionWindow = ({
  focusedWindow,
  setWindows,
  setFocusedWindow,
}: {
  focusedWindow: Windows;
  setWindows: Dispatch<SetStateAction<Windows[]>>;
  setFocusedWindow: Dispatch<SetStateAction<Windows>>;
}) => {
  const [nfts, setNfts] = useState<Array<{ name: string; image: string }>>();
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");

  const { wallet, connected } = useWallet();

  const connection = new Connection(process.env.NEXT_PUBLIC_ENDPOINT as string);
  const metaplex = new Metaplex(connection);

  const getNfts = async () => {
    setNfts([]);
    setStatus("loading");
    const owner = wallet?.adapter.publicKey;
    if (!owner) {
      setStatus("error");
      setMessage("Wallet not connected. Please connect your wallet.");
      return;
    }

    const ownedNfts = (await metaplex.nfts().findAllByOwner({ owner })).filter(
      (nft) =>
        nft.collection?.address.toString() ===
        "Cm1Srq41fh25Px69Huo4WuzgUb8jLV8wzDJqJAA1bVZY"
    );

    const newNfts = [];
    for (const nft of ownedNfts) {
      let newNft = {
        name: nft.name,
        image: "",
      };
      const uri = await fetch(nft.uri).then((res) => res.json());
      console.log(nft.address.toString());
      newNft.image = uri.image;
      newNfts.push(newNft);
    }

    if (newNfts.length === 0) {
      setStatus("error");
      setMessage("No NFTs found :(");
      return;
    }

    setNfts(newNfts);
    setStatus("loaded");
  };

  useEffect(() => {
    getNfts();
  }, [connected, wallet]);

  return (
    <div
      className={`absolute text-[#dedede] flex flex-col border-2 rounded h-[60%] md:h-[70%] animate-open w-[75%] top-10 right-16 bottom-0 my-auto`}
      style={{ zIndex: focusedWindow === "collection" ? 30 : 20 }}
    >
      <div className="absolute space-x-2 items-center flex z-30 top-0 w-full h-6 p-1 bg-gradient-to-r from-[#cea6d4] via-[#dddddd] to-[#cea6d4]">
        <button
          onClick={() =>
            setWindows((prev) => prev.filter((w) => w !== "collection"))
          }
          className="bg-red-500 rounded-full h-4 w-4 flex justify-center items-center"
        >
          <Icon path={mdiClose} className="h-3 text-black" />
        </button>
        <p className="text-sm text-white drop-shadow font-bold">
          Paingelz Collection
        </p>
      </div>
      <div
        onClick={() => setFocusedWindow("collection")}
        className="flex h-full pt-10 p-2 relative overflow-y-scroll flex-col bg-black"
      >
        <h2 className="text-2xl pb-4 text-center font-bold">
          Paingelz Collection
        </h2>
        {nfts && (
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
            {nfts.map((nft, i) => {
              return (
                <div
                  key={i}
                  className="flex space-y-2 flex-col justify-center items-center w-full h-full max-w-[1000px] overflow-hidden"
                >
                  <img src={nft.image} className="w-full h-full object-cover" />
                  <p>{nft.name}</p>
                </div>
              );
            })}
          </div>
        )}
        {status === "loading" ? (
          <div className="grid grid-cols-2 gap-2 h-full">
            <div className="bg-[#696969] animate-pulse"></div>
            <div className="bg-[#696969] animate-pulse"></div>
            <div className="bg-[#696969] animate-pulse"></div>
            <div className="bg-[#696969] animate-pulse"></div>
            <div className="bg-[#696969] animate-pulse"></div>
            <div className="bg-[#696969] animate-pulse"></div>
          </div>
        ) : (
          status === "error" && (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-center">{message}</p>
              {message.includes("wallet") && <WalletMultiButton />}
            </div>
          )
        )}
      </div>
    </div>
  );
};

const ArtistWindow = ({
  focusedWindow,
  setWindows,
  setFocusedWindow,
}: {
  focusedWindow: Windows;
  setWindows: Dispatch<SetStateAction<Windows[]>>;
  setFocusedWindow: Dispatch<SetStateAction<Windows>>;
}) => {
  return (
    <div
      className={`absolute text-[#dedede] flex flex-col border-2 rounded h-[60%] md:h-[70%] animate-open w-[75%] top-10 right-16 bottom-0 my-auto`}
      style={{ zIndex: focusedWindow === "artist" ? 30 : 20 }}
    >
      <div className="absolute space-x-2 items-center flex z-30 top-0 w-full h-6 p-1 bg-gradient-to-r from-[#cea6d4] via-[#dddddd] to-[#cea6d4]">
        <button
          onClick={() =>
            setWindows((prev) => prev.filter((w) => w !== "artist"))
          }
          className="bg-red-500 rounded-full h-4 w-4 flex justify-center items-center"
        >
          <Icon path={mdiClose} className="h-3 text-black" />
        </button>
        <p className="text-sm text-white drop-shadow font-bold">Artist</p>
      </div>
      <div
        onClick={() => setFocusedWindow("artist")}
        className="flex h-full pt-10 p-2 relative overflow-y-scroll flex-col bg-black"
      >
        <h2 className="text-2xl pb-4 text-center font-bold">
          Artist - Sandy Kupfer
        </h2>
        <div className="pb-4 flex justify-center">
          <Image
            src="/art1.jpg"
            alt="art1"
            width={700}
            height={400}
            className="w-full h-full max-w-[700px]"
          />
        </div>
        <div className="p-4 text-sm pt-0 space-y-2">
          <p className="">
            {`Sandy Kupfer is multidisciplinary artist with a focus in painting, tattooing, and drawing. Sandy is a Los Angeles based artist who grew up in Pennsylvania. Sandy graduated with a BA in Fine Arts from Occidental College in 2022, and is set to graduate with a Master’s degree in Fine Arts from Otis College of Art and Design in December 2024. In 2023, Sandy had two solo painting exhibitions with Neo LA Gallery. More recently, Sandy showed with Ceradon Gallery in their inaugural group show “Premiere Ink” and has more shows to come.  Alongside tattooing as a resident at Da Kastle, Sandy also facilitates healing art groups in mental health and recovery centers.`}
          </p>
          <div className="flex justify-center">
            <Image
              src="/art3.jpg"
              width={220}
              height={300}
              alt="art3"
              className="object-contain max-h-[300px]"
            />
          </div>
          <p>{`Sandy’s work is a subversive act to encapsulate realms less frequented in spiritually high energy. Sandy dives deep into a vulnerable authenticity of self - utilizing meaningful emotive topics, expressed through intense gestural strokes and mark making. When engaging with Sandy’s work, there is a forced confrontation with raw and unfiltered heart and spirit. This process of creation derives from the honest nature of Sandy’s mentally and physically disabled brother’s art practice. Sandy is extremely close to him, and helped play the role of care taker for him until relocating. In this time, Sandy saw how Sandy's brother’s works transcended everything, to get to the core of true expression. Sandy strives to do the same.`}</p>
          <div className="space-y-2 pt-4 xl:grid xl:grid-cols-2 xl:gap-2 xl:space-y-0 flex flex-col items-center">
            <div className="flex justify-center">
              <Image
                src="/art2.jpg"
                width={300}
                height={300}
                alt="art2"
                className="object-contain max-h-[300px]"
              />
            </div>
            <div className="w-full flex justify-center">
              <Image
                src="/art7.jpg"
                width={220}
                height={300}
                alt="art7"
                className="object-contain max-h-[300px]"
              />
            </div>
            <div className="w-full flex justify-center">
              <Image
                src="/art4.jpg"
                width={400}
                height={300}
                alt="art4"
                className="object-contain max-h-[300px]"
              />
            </div>
            <div className="w-full flex justify-center">
              <Image
                src="/art5.jpg"
                width={300}
                height={300}
                alt="art5"
                className="object-contain max-h-[300px]"
              />
            </div>
            <div className="w-full flex justify-center">
              <Image
                src="/art6.jpg"
                width={300}
                height={300}
                alt="art6"
                className="object-contain max-h-[300px]"
              />
            </div>
            <div className="w-full flex justify-center">
              <Image
                src="/art8.jpg"
                width={260}
                height={300}
                alt="art8"
                className="object-contain max-h-[300px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SocialsWindow = ({
  setWindows,
  setFocusedWindow,
  focusedWindow,
}: {
  setWindows: Dispatch<SetStateAction<Windows[]>>;
  setFocusedWindow: Dispatch<SetStateAction<Windows>>;
  focusedWindow: Windows;
}) => {
  return (
    <div
      className={`absolute text-[#dedede] flex flex-col border-2 rounded h-[60%] md:h-[70%] animate-open w-[75%] top-10 right-16 bottom-0 my-auto`}
      style={{ zIndex: focusedWindow === "community" ? 30 : 20 }}
    >
      <div className="absolute space-x-2 items-center flex z-30 top-0 w-full h-6 p-1 bg-gradient-to-r from-[#a6d4a7] via-[#dddddd] to-[#a6d4a7]">
        <button
          onClick={() =>
            setWindows((prev) => prev.filter((w) => w !== "community"))
          }
          className="bg-red-500 rounded-full h-4 w-4 flex justify-center items-center"
        >
          <Icon path={mdiClose} className="h-3 text-black" />
        </button>
        <p className="text-sm text-white drop-shadow font-bold">Community</p>
      </div>
      <div
        onClick={() => setFocusedWindow("community")}
        className="flex h-full pt-10 p-2 relative overflow-y-scroll flex-col bg-black"
      >
        <h2 className="text-2xl pb-4 text-center font-bold">Community</h2>
        <div className="grid gap-2 grid-cols-2">
          <Link
            className="p-1 border text-center"
            href={"https://twitter.com/paingelz"}
          >
            X/Twitter
          </Link>
          <Link
            className="p-1 border text-center"
            href={"https://t.me/paingelzportal"}
          >
            Telegram
          </Link>
        </div>
      </div>
    </div>
  );
};

const ClaimButton = () => {
  return (
    <div className="fixed inset-0 z-[99] bg-black/50 backdrop-blur-sm flex justify-center items-center">
      <div className="animate-fadeUp p-2 rounded border"></div>
    </div>
  );
};
