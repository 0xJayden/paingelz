import { Windows } from "@/types";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

const BottomNavbarIcon = ({
  icon,
  text,
  openWindow,
  windows,
}: {
  icon: string;
  text: Windows;
  openWindow: (window: Windows) => void;
  windows: Windows[];
}) => {
  return (
    <button
      onClick={() => openWindow(text)}
      className="h-20 w-20 flex items-center justify-center flex-col"
    >
      <Image
        src={icon}
        width={40}
        height={40}
        alt={text + "icon"}
        className="min-h-10 min-w-10"
      />
      {windows.includes(text) && (
        <div className="rounded-full bg-white h-1 w-1"></div>
      )}
    </button>
  );
};

export const BottomNavbar = ({
  setWindows,
  setFocusedWindow,
  windows,
}: {
  setWindows: Dispatch<SetStateAction<Windows[]>>;
  setFocusedWindow: Dispatch<SetStateAction<Windows>>;
  windows: Windows[];
}) => {
  const openWindow = (window: Windows) => {
    if (windows.includes(window)) {
      setWindows((prev) => prev.filter((w) => w !== window));
    } else {
      setWindows((prev) => [...prev, window]);
      setFocusedWindow(window);
    }
  };

  return (
    <div className="absolute bottom-0 p-2 z-20 left-0 right-0 h-20">
      <div className="bg-[#20201d]/70 space-x-2 px-2 backdrop-blur overflow-y-hidden overflow-x-scroll h-full rounded-xl flex p-1 items-center">
        <WalletMultiButton />
        <div className="h-full border border-[#555555]"></div>
        <BottomNavbarIcon
          icon="/minticon.png"
          text="mint"
          openWindow={openWindow}
          windows={windows}
        />
        <BottomNavbarIcon
          icon="/mapicon.png"
          text="map"
          openWindow={openWindow}
          windows={windows}
        />
        <BottomNavbarIcon
          icon="/gameicon.png"
          text="game"
          openWindow={openWindow}
          windows={windows}
        />
        <BottomNavbarIcon
          icon="/brain.png"
          text="personality"
          openWindow={openWindow}
          windows={windows}
        />
        <BottomNavbarIcon
          icon="/clouds.png"
          text="socials"
          openWindow={openWindow}
          windows={windows}
        />
        <BottomNavbarIcon
          icon="/starsPaingel.png"
          text="collection"
          openWindow={openWindow}
          windows={windows}
        />
        <BottomNavbarIcon
          icon="/artist.png"
          text="artist"
          openWindow={openWindow}
          windows={windows}
        />
        <BottomNavbarIcon
          icon="/star.png"
          text="chat"
          openWindow={openWindow}
          windows={windows}
        />
      </div>
    </div>
  );
};
