import Image from "next/image";
import { Inter } from "next/font/google";
import Icon from "@mdi/react";
import { mdiClose } from "@mdi/js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [openMint, setOpenMint] = useState(false);
  const [dots, setDots] = useState<Array<Dot>>([]);
  const [openSplash, setOpenSplash] = useState(true);

  const requestRef = useRef<number>(0);

  const animate = () => {
    setDots((prev) => {
      return prev.map((dot) => {
        let newX = dot.x + dot.xSpeed;
        let newY = dot.y + dot.ySpeed * dot.yAcceleration;
        let newYAcceleration = dot.yAcceleration + 0.02;

        return {
          x: newX,
          y: newY,
          xSpeed: dot.xSpeed,
          ySpeed: dot.ySpeed,
          yAcceleration: newYAcceleration,
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
        xSpeed: Math.random() * (i % 2 === 0 ? 2 : -2),
        ySpeed: Math.random() * 2,
        yAcceleration: 1.01,
        size: 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setDots(newDots);
  };

  useEffect(() => {
    setTimeout(() => {
      setOpenSplash(false);
    }, 3200);
    setTimeout(() => {
      setOpenMint(true);
    }, 6000);
    document.addEventListener("click", generateDots);
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <main
      className={`absolute flex inset-0 overflow-hidden text-white bg-[#99ccff] flex-col items-center justify-between ${inter.className}`}
    >
      {openSplash ? (
        <Splash />
      ) : (
        <>
          <div className="absolute z-10 inset-0">
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
          </div>
          <div className="absolute inset-0">
            <Image
              src={"/bgfinal.png"}
              className="w-full h-full object-cover"
              width={1000}
              height={1000}
              alt="bga"
            />
          </div>
          <IconContainer setOpenMint={setOpenMint} openMint={openMint} />
          {openMint && <MintWindow setOpenMint={setOpenMint} />}
          <BottomNavbar setOpenMint={setOpenMint} openMint={openMint} />
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
}: {
  setOpenMint: Dispatch<SetStateAction<boolean>>;
}) => {
  const [dots, setDots] = useState<Array<Dot>>([]);

  const dotContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

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

  return (
    <div className="absolute animate-open z-20 text-[#00eeee]">
      <div
        ref={dotContainerRef}
        className="flex flex-col h-full relative border-2 rounded bg-black"
      >
        <div className="items-center z-20 w-full space-x-2 flex top-0 left-0 h-6 p-1 right-0 bg-gradient-to-r from-[#ffffc9] via-[#eeeeee] to-[#ffffc9]">
          <button
            onClick={() => setOpenMint(false)}
            className="bg-red-500 rounded-full h-full aspect-square flex justify-center items-center"
          >
            <Icon path={mdiClose} className="h-3 text-black" />
          </button>
          <p className="text-white text-sm drop-shadow font-bold">
            Paingelz Mint
          </p>
        </div>
        <div className="flex w-full justify-center items-center">
          <video
            className="h-full w-[150px]"
            src="/paingelzlogo.mov"
            muted
            autoPlay
            loop
            playsInline
          />
        </div>
        <div className="relative z-20 h-full w-full">
          <video
            className="h-full w-full"
            src="/paingelzvid.mp4"
            muted
            autoPlay
            loop
            playsInline
          />
        </div>
        <button
          onClick={() => generateDots()}
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
        <div className="p-2 z-10 flex items-center justify-center flex-col border border-dashed py-4 border-[#00eeee] space-y-2">
          <p>Feel the pain</p>
        </div>
      </div>
    </div>
  );
};

const IconContainer = ({
  setOpenMint,
  openMint,
}: {
  setOpenMint: Dispatch<SetStateAction<boolean>>;
  openMint: boolean;
}) => {
  return (
    <div className="absolute p-4 inset-0 z-10">
      <MintIcon setOpenMint={setOpenMint} openMint={openMint} />
    </div>
  );
};

const MintIcon = ({
  setOpenMint,
  openMint,
}: {
  setOpenMint: Dispatch<SetStateAction<boolean>>;
  openMint: boolean;
}) => {
  return (
    <button
      onClick={() => setOpenMint(!openMint)}
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

const BottomNavbar = ({
  setOpenMint,
  openMint,
}: {
  setOpenMint: Dispatch<SetStateAction<boolean>>;
  openMint: boolean;
}) => {
  return (
    <div className="absolute bottom-0 p-2 z-20 left-0 right-0 h-20">
      <div className="bg-[#20201d]/70 space-x-2 px-2 backdrop-blur h-full rounded-xl flex p-1 items-center">
        <WalletMultiButton />
        <div className="h-full border border-[#555555]"></div>
        <button
          onClick={() => setOpenMint(!openMint)}
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
      </div>
    </div>
  );
};

const Splash = () => {
  const [barWidth, setBarWidth] = useState("0%");

  useEffect(() => {
    setTimeout(() => {
      setBarWidth("10%");
    }, 500);
    setTimeout(() => {
      setBarWidth("20%");
    }, 1500);
    setTimeout(() => {
      setBarWidth("50%");
    }, 2000);
    setTimeout(() => {
      setBarWidth("70%");
    }, 2200);
    setTimeout(() => {
      setBarWidth("90%");
    }, 2500);
    setTimeout(() => {
      setBarWidth("100%");
    }, 2900);
  }, []);

  return (
    <div className="w-full relative h-screen flex flex-col space-y-2 items-center justify-center bg-black">
      <video
        src="/paingelzlogo.mov"
        className="w-[50%]"
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
          {barWidth === "100%" ? `Let's gooo!` : "Loading..."}
        </p>
      </div>
    </div>
  );
};
