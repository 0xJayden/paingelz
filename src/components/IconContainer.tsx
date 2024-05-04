import { Windows } from "@/types";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

export const IconContainer = ({
  setWindows,
  setFocusedWindow,
}: {
  setFocusedWindow: Dispatch<SetStateAction<Windows>>;
  setWindows: Dispatch<SetStateAction<Windows[]>>;
}) => {
  const openWindow = (window: Windows) => {
    setWindows((prev) => {
      if (prev.includes(window)) return prev;
      return [...prev, window];
    });
    setFocusedWindow(window);
  };

  return (
    <div className="absolute gap-4 gap-y-10 grid grid-cols-4 p-4 w-full z-10">
      <IconContainerIcon
        icon="/minticon.png"
        text="Mint Paingelz"
        alt="mint"
        openWindow={() => openWindow("mint")}
      />
      <IconContainerIcon
        icon="/mapicon.png"
        text="Paingelz World"
        alt="map"
        openWindow={() => openWindow("map")}
      />
      <IconContainerIcon
        icon="/gameicon.png"
        text="Play Game"
        alt="game"
        openWindow={() => openWindow("game")}
      />
      <IconContainerIcon
        icon="/brain.png"
        text="Personality Test"
        alt="personality"
        openWindow={() => openWindow("personality")}
      />
      <IconContainerIcon
        icon="/clouds.png"
        text="Community"
        alt="socials"
        openWindow={() => openWindow("socials")}
      />
      <IconContainerIcon
        icon="/starsPaingel.png"
        text="View Collection"
        alt="collection"
        openWindow={() => openWindow("collection")}
      />
      <IconContainerIcon
        icon="/artist.png"
        text="Meet the Artist"
        alt="artist"
        openWindow={() => openWindow("artist")}
      />
      <IconContainerIcon
        icon="/star.png"
        text="Chat"
        alt="chat"
        openWindow={() => openWindow("chat")}
      />
    </div>
  );
};

const IconContainerIcon = ({
  icon,
  alt,
  text,
  openWindow,
}: {
  icon: string;
  alt: Windows;
  text: string;
  openWindow: () => void;
}) => {
  return (
    <button
      onClick={openWindow}
      className="h-20 w-20 flex items-center justify-center flex-col"
    >
      <Image
        src={icon}
        width={40}
        height={40}
        alt={alt + "icon"}
        className="min-h-10 min-w-10"
      />
      <p className="text-sm drop-shadow text-center">{text}</p>
    </button>
  );
};
