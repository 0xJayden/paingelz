import { colors } from "@/pages";
import { Windows } from "@/types";
import { trpc } from "@/utils/trpc";
import { mdiArrowRight, mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import Image from "next/image";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";

const Chat = () => {
  const { data } = trpc.chatRouter.getMessages.useQuery(undefined, {
    refetchInterval: 500,
  });

  const scrollToBottom = () => {
    const chat = document.getElementById("chat");
    chat?.scrollTo(0, chat.scrollHeight);
  };

  useEffect(() => {
    scrollToBottom();
  }, [data]);

  return (
    <div
      id="chat"
      className="flex flex-col h-full mb-10 w-full overflow-y-auto"
    >
      {data
        ?.slice()
        .reverse()
        .map((message) => (
          <div key={message.id} className="flex items-center space-x-1">
            {message.image && (
              <Image alt="pfp" width={24} height={24} src={message.image} />
            )}
            <p className="text-sm">
              <span style={{ color: message.color }} className="font-bold">
                {message.name}:{" "}
              </span>
              {message.text}
            </p>
          </div>
        ))}
    </div>
  );
};

export default function ChatWindow({
  setWindows,
  setFocusedWindow,
  focusedWindow,
}: {
  setWindows: Dispatch<SetStateAction<Windows[]>>;
  setFocusedWindow: Dispatch<SetStateAction<Windows>>;
  focusedWindow: Windows;
}) {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [selectedColor, setColor] = useState("");

  const sendMessageMutation = trpc.chatRouter.sendMessage.useMutation({
    onSuccess: () => {
      setText("");
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (text.length > 0 && text.length < 255 && name)
      sendMessageMutation.mutate({ text, name, color: selectedColor });
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length < 255) setText(e.target.value);
  };

  const selectName = (e: FormEvent) => {
    e.preventDefault();

    if (name.length > 0 && name.length < 26) setNameSet(true);
  };

  const handleOnChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length < 26) setName(e.target.value);
  };

  return (
    <div
      className={`absolute text-[#dedede] flex flex-col border-2 rounded h-[60%] md:h-[70%] animate-open w-[75%] top-10 right-16 bottom-0 my-auto`}
      style={{ zIndex: focusedWindow === "chat" ? 30 : 20 }}
    >
      <div className="absolute space-x-2 items-center flex z-30 top-0 w-full h-6 p-1 bg-gradient-to-r from-[#d2a6d4] via-[#dddddd] to-[#d2a6d4]">
        <button
          onClick={() => setWindows((prev) => prev.filter((w) => w !== "chat"))}
          className="bg-red-500 rounded-full h-4 w-4 flex justify-center items-center"
        >
          <Icon path={mdiClose} className="h-3 text-black" />
        </button>
        <p className="text-sm text-white drop-shadow font-bold">Chat</p>
      </div>
      <div
        onClick={() => setFocusedWindow("chat")}
        className="flex h-full pt-10 p-2 relative flex-col bg-black"
      >
        <h2 className="text-2xl pb-4 text-center font-bold">Chat</h2>
        <Chat />
        {nameSet ? (
          <div className="absolute bottom-2 right-2 left-2 border p-1">
            <form onSubmit={handleSubmit} className="relative">
              <input
                className="bg-transparent outline-none w-full"
                placeholder="Say somethin"
                value={text}
                onChange={handleOnChange}
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 my-auto"
              >
                <Icon path={mdiArrowRight} className="h-5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col justify-center items-center backdrop-blur-sm bg-black/30">
            <form onSubmit={selectName}>
              <input
                placeholder="Type a name"
                className="bg-transparent outline-none p-1 border"
                value={name}
                onChange={handleOnChangeName}
                autoFocus
              />
              <h1 className="text-lg py-4 text-center font-bold">
                Select a color
              </h1>
              <div className="grid gap-2 pb-4 justify-items-center justify-content-center grid-cols-3">
                {colors.map((color, i) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setColor(color)}
                    style={{
                      border:
                        color === selectedColor ? "2px solid white" : "none",
                      opacity:
                        selectedColor && color !== selectedColor ? 0.5 : 1,
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
              <button
                type="submit"
                className="border w-full p-1 justify-center flex space-x-2 items-center"
              >
                <p>Submit</p> <Icon path={mdiArrowRight} className="h-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
