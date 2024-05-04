import { useEffect } from "react";

const songs = [
  {
    name: "Chief Keef - Love Sosa Organ House 2014 Mix",
    src: "/music.mp3",
  },
  {
    name: "Linkin Park x Grimes - Breaking the Violence",
    src: "/79 - Linkin Park x Grimes.mp3",
  },
  {
    name: "Ecco2k - Calcium (Show Me Love Mix)",
    src: "/ecco2k - calcium.mp3",
  },
  {
    name: "Vierre Cloud - Moment (Feat. Imogen Heap)",
    src: "/rondo cheek x vierrecloud.mp3",
  },
  {
    name: "Sorry Mama (Dream DJ Team Edit)",
    src: "/Sorry Mama.mp3",
  },
  {
    name: "Chief Keef - Cap Or Die (Remix)",
    src: "/Chief Keef - Cap Or Die.mp3",
  },
  {
    name: "Young Thug - Audemar (Club Mix)",
    src: "/Young Thug - Audemar.mp3",
  },
  {
    name: "SPEAKRR KNOCKRRS - ERIKKA KANEE (NITECORE NOISE EDITT)",
    src: "/SPEAKRR KNOCKRRS - ERIKKA KANEE.mp3",
  },
  {
    name: "Linkin Park x Vengaboys - We like to become numb",
    src: "/Linkin Park x Vengaboys - We like to become numb.mp3",
  },
  {
    name: "Mr Brightside X Love Story",
    src: "/Mr Brightside X Love Story.mp3",
  },
  {
    name: "Unlock x Better Off Alone - CHARLIE XCX Ft Kim Petras And Jay Park_DJ Alice",
    src: "/Unlock x Better Off Alone - CHARLIE XCX Ft Kim Petras And Jay Park_DJ Alice.mp3",
  },
  {
    name: "cave in (flip) [Owl City]",
    src: "/cave in.mp3",
  },
  {
    name: "bladee+ecco2k-girls just wanna have fun(rave edit)",
    src: "/bladee+ecco2k-girls just wanna have fun.mp3",
  },
  {
    name: "chief keef - kay kay (powerdoll ver)",
    src: "/chief keef - kay kay.mp3",
  },
  {
    name: "Crystal Castles - Violent Dreams [Sidewalks and Skeletons REMIX]",
    src: "/Crystal Castles - Violent Dreams.mp3",
  },
  {
    name: "yesterday (prod charlie shuffler)",
    src: "/yesterday.mp3",
  },
  {
    name: "Fire In My Body",
    src: "/Fire In My Body.mp3",
  },
  {
    name: "YUNG HURN - ALLEINE (BRUTALISMUS 3000 RMX) APØZIN EDIT",
    src: "/YUNG HURN - ALLEINE.mp3",
  },
  {
    name: "Rockstar",
    src: "/Rockstar.mp3",
  },
];

const Song = ({
  song,
  audio,
  setAudio,
}: {
  song: (typeof songs)[number];
  audio: HTMLAudioElement | undefined;
  setAudio: (audio: HTMLAudioElement) => void;
}) => {
  const handleClick = () => {
    audio?.pause();
    audio?.remove();
    const newAudio = new Audio(song.src);
    setAudio(newAudio);
    newAudio?.play();
  };

  return (
    <button onClick={handleClick} className="border p-1">
      <p
        style={{
          color: audio?.src.replaceAll("%20", " ").includes(song.src)
            ? "#00ff00"
            : "white",
        }}
        className="text-xs"
      >
        {song.name}
      </p>
    </button>
  );
};

export default function Radio({
  setAudio,
  audio,
}: {
  setAudio: (audio: HTMLAudioElement) => void;
  audio: HTMLAudioElement | undefined;
}) {
  useEffect(() => {
    const handleEnd = () => {
      audio?.remove();
      const index = songs.findIndex((song) =>
        audio?.src.replaceAll("%20", " ").includes(song.src)
      );
      let nextSong = songs[index + 1];
      if (!nextSong) nextSong = songs[0];

      const newAudio = new Audio(nextSong.src);
      setAudio(newAudio);
      newAudio?.play();
    };

    audio?.addEventListener("ended", handleEnd);

    return () => {
      audio?.removeEventListener("ended", handleEnd);
    };
  }, [audio]);

  return (
    <div className="absolute right-2 flex flex-col top-0 bottom-0 p-1 my-auto h-[250px] bg-black w-[220px] border">
      <h1 className="text-center">Radio</h1>
      <div className="space-y-2 h-full flex flex-col overflow-y-scroll">
        {songs.map((song, i) => (
          <Song key={i} song={song} audio={audio} setAudio={setAudio} />
        ))}
      </div>
    </div>
  );
}
