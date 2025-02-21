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
        <div className="w-full bg-[#F6F7F9] rounded-2xl  max-w-2xl p-4">
            {/* Search Box */}
            <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-3xl shadow-sm overflow-hidden">
                <input
                    type="text"
                    placeholder="Search YouTube videos..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full p-2 outline-none "
                />
                <button
                    type="submit"
                    className="bg-black text-white rounded-[550px]  px-3 py-3 hover:bg-gray-800 transition-colors flex items-center"
                >
                    <Search className="w-5 h-5   " />
                </button>
            </form>

            {/* Loading Indicator */}
            {loading && <p className="text-center text-gray-500 mt-2">Searching...</p>}

            {/* Search Results */}
            <ul className="mt-6 space-y-2 ">
                {results.map((video) => (
                    <li
                        key={video.id.videoId}
                        className="flex items-center gap-3 px-2 py-1 border-b cursor-pointer bg-white rounded-2xl hover:bg-gray-100 transition"
                        onClick={() => onVideoSelect(video.id.videoId)}
                    >
                        <img
                            src={video.snippet.thumbnails.default.url}
                            alt={video.snippet.title}
                            className="w-16 h-10 rounded-md"
                        />
                        <div>
                            <h3 className="text-sm font-semibold">{video.snippet.title}</h3>
                            <p className="text-xs text-gray-500">{video.snippet.channelTitle}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default VideoSearch;
