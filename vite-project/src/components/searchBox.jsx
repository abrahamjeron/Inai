import React, { useState } from "react";
import { Search } from "lucide-react";

const API_KEY = import.meta.env.VITE_YOUTUBE_V3_KEY;

function VideoSearch({ onVideoSelect }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);

        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=5&key=${API_KEY}`
            );
            const data = await response.json();
            setResults(data.items || []);
        } catch (error) {
            console.error("Error fetching YouTube videos:", error);
        }

        setLoading(false);
    };

    return (
        <div className="w-[450px] md:w-[350px] lg:w-[350px] bg-[#F6F7F9] rounded-2xl p-2 sm:p-4">
            {/* Search Box */}
            <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-3xl shadow-sm overflow-hidden">
                <input
                    type="text"
                    placeholder="Search YouTube videos..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full p-2 text-sm sm:text-base outline-none"
                />
                <button
                    type="submit"
                    className="bg-black text-white rounded-full px-2 py-2 sm:px-3 sm:py-3 hover:bg-gray-800 transition-colors flex items-center justify-center"
                >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </form>

            {/* Loading Indicator */}
            {loading && <p className="text-center text-gray-500 mt-2">Searching...</p>}

            {/* Search Results */}
            <ul className="mt-4 sm:mt-6 space-y-2 max-h-[300px] overflow-y-auto">
                {results.map((video) => (
                    <li
                        key={video.id.videoId}
                        className="flex items-center gap-2 sm:gap-3 px-2 py-1 border-b cursor-pointer bg-white rounded-2xl hover:bg-gray-100 transition w-full"
                        onClick={() => onVideoSelect(video.id.videoId)}
                    >
                        <img
                            src={video.snippet.thumbnails.default.url}
                            alt={video.snippet.title}
                            className="w-12 h-8 sm:w-16 sm:h-10 rounded-md object-cover"
                        />
                        <div className="overflow-hidden">
                            <h3 className="text-xs sm:text-sm font-semibold truncate w-[250px]">{video.snippet.title}</h3>
                            <p className="text-xs text-gray-500 truncate w-[250px]">{video.snippet.channelTitle}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default VideoSearch;