import Image from "next/image";
import { Inter } from "next/font/google";
import Icon from "@mdi/react";
import { mdiClose } from "@mdi/js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [openMint, setOpenMint] = useState(true);
  const [dots, setDots] = useState<Array<Dot>>([]);

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
        x: e.clientX,
        y: e.clientY,
        xSpeed: Math.random() * 2,
        ySpeed: Math.random() * 2,
        yAcceleration: 1.01,
        size: 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setDots(newDots);
  };

  useEffect(() => {
    document.addEventListener("click", generateDots);
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <main
      className={`relative flex min-h-screen overflow-hidden bg-[#99ccff] flex-col items-center justify-between ${inter.className}`}
    >
      <div className="absolute z-30 inset-0">
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
        let newYAcceleration = dot.yAcceleration + 0.02;

        if (
          !dotContainerRef.current?.offsetWidth ||
          !dotContainerRef.current?.offsetHeight
        )
          return dot;

        if (newX >= dotContainerRef.current.offsetWidth - 10 || newX <= 0) {
          dot.xSpeed = -dot.xSpeed;
        }

        if (newY >= dotContainerRef.current.offsetHeight - 20 || newY <= 10) {
          dot.yAcceleration = -dot.yAcceleration;
          dot.ySpeed = -dot.ySpeed;
        }

        if (newY > dotContainerRef.current?.offsetHeight || newY < 0) {
          dot.y = Math.random() * dotContainerRef.current.offsetHeight - 20;
        }

        // if (newX > dotContainerRef.current?.offsetWidth || newX < 0) {
        //   dot.x = Math.random() * dotContainerRef.current?.offsetWidth - 10;
        // }

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
    <div className="absolute top-10 z-20 text-[#00eeee] w-[45%] h-[45%] right-10">
      <div
        ref={dotContainerRef}
        className="flex justify-center flex-col h-full items-center relative border-2 rounded bg-[#20201d]"
      >
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
              className={`absolute rounded-full`}
            >
              *
            </div>
          );
        })}
        <div className="absolute items-center space-x-2 flex top-0 left-0 h-6 p-1 right-0 bg-gradient-to-r from-[#ffffc9] via-[#eeeeee] to-[#ffffc9]">
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
        <h1 className="text-white pb-4 text-2xl font-bold p-2">
          Mint Paingelz
        </h1>
        <div className="p-2 flex items-center justify-center flex-col border border-dashed py-4 border-[#00eeee] space-y-2">
          <p>Feel the pain</p>
          <button
            onClick={() => generateDots()}
            className="border border-[#00eeee] p-1 px-5"
          >
            Mint
          </button>
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
