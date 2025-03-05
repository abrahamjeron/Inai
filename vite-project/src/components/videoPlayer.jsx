import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Rewind, FastForward, SkipBack, SkipForward } from "lucide-react";

function YouTubePlayer({ videoId, socket, roomName }) {
    const [isPlaying, setIsPlaying] = useState(true);
    const [videoTitle, setVideoTitle] = useState("");
    const iframeRef = useRef(null);

    useEffect(() => {
        const handlePlayMusic = (data) => {
            if (data.roomName === roomName && data.videoId === videoId) {
                setIsPlaying(true); 
                sendCommand("playVideo");
            }
        };
    
        const handlePauseMusic = (data) => {
            if (data.roomName === roomName && data.videoId === videoId) {
                setIsPlaying(false); 
                sendCommand("pauseVideo");
            }
        };
    
        socket.on('play music', handlePlayMusic);
        socket.on('pause music', handlePauseMusic);
    
        return () => {
            socket.off('play music', handlePlayMusic);
            socket.off('pause music', handlePauseMusic);
        };
    }, [socket, roomName, videoId]);
    

    useEffect(() => {
        if (videoId) {
            fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
                .then((res) => res.json())
                .then((data) => setVideoTitle(data.title || "Unknown Video"))
                .catch((err) => console.error("Error fetching title:", err));
        }
    }, [videoId]);

    const sendCommand = (command, args = "") => {
        if (iframeRef.current) {
            iframeRef.current.contentWindow.postMessage(
                JSON.stringify({ event: "command", func: command, args: [args] }),
                "*"
            );
        }
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            socket.emit('pause music', { roomName, videoId });
        } else {
            socket.emit('play music', { roomName, videoId });
        }
    };
    

    const seekVideo = (seconds) => {
        sendCommand("getCurrentTime");
        window.addEventListener("message", function handleSeek(event) {
            try {
                const data = JSON.parse(event.data);
                if (data.event === "infoDelivery" && data.info && typeof data.info.currentTime === "number") {
                    const newTime = data.info.currentTime + seconds;
                    sendCommand("seekTo", newTime);
                    window.removeEventListener("message", handleSeek);
                }
            } catch (err) {
                // Only log if it's actually a JSON parse error
                if (err instanceof SyntaxError) {
                    console.error("Error parsing message data:", err);
                }
            }
        });
    };

    return (
        <div className="flex flex-col items-center gap-2 sm:gap-4 p-2 sm:p-4 w-full">
            <div className="w-[350px] md:w-[600px] lg:w-[700px] flex flex-col">
                <div className="w-full h-[250px] md:h-[350px] lg:h-[400px] rounded-2xl overflow-hidden relative">
                <iframe
                ref={iframeRef}
                id="youtube-player"
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&rel=0&modestbranding=1&autoplay=1&mute=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-2xl"
            ></iframe>

                </div>
                {videoTitle && (
                    <h2 className="text-xs sm:text-base md:text-lg font-semibold mt-1 sm:mt-2 truncate px-2 w-[350px] md:w-[600px] lg:w-[800px]">
                        {videoTitle}
                    </h2>
                )}

                {/* Controls */}
                <div className="w-[350px] md:w-[600px] lg:w-[700px] mx-auto py-2 sm:py-3 mt-2 sm:mt-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center justify-center gap-1 sm:gap-4">
                        <button
                            className="p-1 sm:p-3 bg-black rounded-full text-white hover:bg-gray-800 transition-colors"
                            aria-label="Rewind 10 seconds"
                            onClick={() => seekVideo(-10)}
                        >
                            <Rewind className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>

                        <button
                            className="p-1 sm:p-3 bg-black rounded-full text-white hover:bg-gray-800 transition-colors"
                            aria-label="Previous track"
                        >
                            <SkipBack className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>

                        <button
                            className="p-2 sm:p-3 bg-black rounded-full text-white hover:bg-gray-800 transition-colors"
                            aria-label={isPlaying ? "Pay" : "Pause"}
                            onClick={togglePlayPause}
                        >
                            {isPlaying ? 
                                <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : 
                                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                            }
                        </button>

                        <button
                            className="p-1 sm:p-3 bg-black rounded-full text-white hover:bg-gray-800 transition-colors"
                            aria-label="Next track"
                        >
                            <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>

                        <button
                            className="p-1 sm:p-3 bg-black rounded-full text-white hover:bg-gray-800 transition-colors"
                            aria-label="Forward 10 seconds"
                            onClick={() => seekVideo(10)}
                        >
                            <FastForward className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default YouTubePlayer;