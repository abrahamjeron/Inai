import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Rewind, FastForward, SkipBack, SkipForward } from "lucide-react";

function YouTubePlayer({ videoId, socket, roomName }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoTitle, setVideoTitle] = useState("");
    const iframeRef = useRef(null);

    useEffect(() => {
        const handlePlayMusic = (data) => {
            if (data.roomName === roomName && data.videoId === videoId) {
                sendCommand("playVideo");
                setIsPlaying(true);
            }
        };

        const handlePauseMusic = (data) => {
            if (data.roomName === roomName && data.videoId === videoId) {
                sendCommand("pauseVideo");
                setIsPlaying(false);
            }
        };

        // Listen for both play and pause events
        socket.on('play music', handlePlayMusic);
        socket.on('pause music', handlePauseMusic);

        // Clean up event listeners
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
            socket.emit('pause music', {
                roomName: roomName,
                videoId: videoId
            });
            sendCommand("pauseVideo");
            setIsPlaying(false); // Update local state immediately
        } else {
            socket.emit('play music', {
                roomName: roomName,
                videoId: videoId
            });
            sendCommand("playVideo");
            setIsPlaying(true); // Update local state immediately
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
            <div className="w-full max-w-full sm:max-w-4xl flex flex-col">
                <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden relative">
                    <iframe
                        ref={iframeRef}
                        id="youtube-player"
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-2xl"
                    ></iframe>
                </div>
                {videoTitle && (
                    <h2 className="text-xs sm:text-base md:text-lg font-semibold mt-1 sm:mt-2 truncate px-2">
                        {videoTitle}
                    </h2>
                )}

                {/* Controls */}
                <div className="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto py-2 sm:py-3 mt-2 sm:mt-4 bg-gray-50 rounded-2xl">
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
                            aria-label={isPlaying ? "Pause" : "Play"}
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
export default YouTubePlayer