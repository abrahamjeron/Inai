// import React, { useState, useEffect, useRef } from 'react';
// import YouTube from 'react-youtube';
// import axios from 'axios';
// import { Search, SkipForward, Play, Pause } from 'lucide-react';
// import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";


// const MusicPlayer = ({ room, user, socket }) => {
//   const [playlist, setPlaylist] = useState({ songs: [], currentSong: null });
//   const [videoUrl, setVideoUrl] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState({videoId: "Hz9WdJqlRcI?si=NjIfEvR7cyoXj-iF"});
//   const [isSearching, setIsSearching] = useState(false);
//   const [player, setPlayer] = useState(null);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [isDJ, setIsDJ] = useState(false);
//   const [apiError, setApiError] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const lastStateChange = useRef(null);
//   const API_KEY = 'AIzaSyBkXfU9kefLdO3SzcGN_5hQRGqapZ-4zBM';

//   useEffect(() => {
//     if (!room || !room._id) {
//       setApiError('Room information is missing or invalid');
//       setIsLoading(false);
//       return;
//     }

//     setIsAdmin(room.admins?.includes(user.username));
//     setIsDJ(room.djs?.includes(user.username));
//     fetchPlaylist();

//     socket.on('playlist updated', (newPlaylist) => {
//       setPlaylist(newPlaylist);
//     });

//     socket.on('music state changed', ({ videoId, position, isPlaying, timestamp }) => {
//       if (!player) return;
//       if (lastStateChange.current === timestamp) return;
//       lastStateChange.current = timestamp;

//       try {
//         if (isPlaying) {
//           player.loadVideoById(videoId, position);
//         } else {
//           player.pauseVideo();
//           player.seekTo(position);
//         }
//       } catch (error) {
//         console.error('Error changing player state:', error);
//         setApiError('Error controlling the YouTube player');
//       }
//     });

//     return () => {
//       socket.off('playlist updated');
//       socket.off('music state changed');
//     };
//   }, [room, user, socket, player]);

//   const searchVideos = async (query) => {
//     if (!query.trim()) {
//       setSearchResults([]);
//       return;
//     }

//     try {
//       const response = await axios.get(
//         `https://www.googleapis.com/youtube/v3/search`,
//         {
//           params: {
//             part: 'snippet',
//             maxResults: 5,
//             q: query,
//             type: 'video',
//             key: API_KEY
//           }
//         }
//       );
//       console.log(response.data)

//       setSearchResults(response.data.items.map(item => ({
//         videoId: item.id.videoId,
//         title: item.snippet.title,
//         thumbnail: item.snippet.thumbnails.default.url
//       })));
//     } catch (error) {
//       console.error('Search error:', error);
//       setApiError('Failed to search YouTube videos');
//     }
//   };

//   const fetchPlaylist = async () => {
//     if (!room || !room._id) {
//       setApiError('Cannot fetch playlist: Room ID is missing');
//       setIsLoading(false);
//       return;
//     }
  
//     try {
//       setIsLoading(true);
//       console.log('Fetching playlist for room:', room._id); // Debug log
      
//       // First, ensure the playlist exists for this room
//       try {
//         await axios.post(
//           `http://localhost:3001/rooms/${room._id}/playlist/init`,
//           { roomName: room.name },
//           { headers: { Authorization: user.token } }
//         );
//       } catch (error) {
//         // Ignore if playlist already exists
//         if (error.response?.status !== 409) {
//           throw error;
//         }
//       }
  
//       // Then fetch the playlist
//       const response = await axios.get(
//         `http://localhost:3001/rooms/${room._id}/playlist`,
//         { 
//           headers: { Authorization: user.token },
//           params: { roomName: room.name } // Add room name as query parameter
//         }
//       );
      
//       console.log('Playlist response:', response.data); // Debug log
//       setPlaylist(response.data);
//       setIsLoading(false);
//       setApiError(null);
//     } catch (error) {
//       console.error('Error fetching playlist:', error);
//       setIsLoading(false);
//       if (error.response?.status === 404) {
//         setApiError('Playlist not found. Try refreshing the page.');
//       } else {
//         setApiError('Failed to load playlist. Please try again.');
//       }
//     }
//   };

//   const addSong = async (videoId, title, thumbnail) => {
//     if (!room || !room._id) {
//       setApiError('Cannot add song: Room ID is missing');
//       return;
//     }

//     try {
//       await axios.post(
//         `http://localhost:3001/rooms/${room._id}/playlist`,
//         { videoId, title, thumbnail },
//         { headers: { Authorization: user.token } }
//       );
//       setVideoUrl('');
//       setSearchResults([]);
//       setSearchQuery('');
//       setApiError(null);
//     } catch (error) {
//       console.error('Error adding song:', error);
//       setApiError('Failed to add song');
//     }
//   };

//   const skipSong = () => {
//     if (!playlist.songs.length || !player) return;

//     const currentVideoId = player.getVideoData().video_id;
//     const currentIndex = playlist.songs.findIndex(song => song.videoId === currentVideoId);
    
//     if (currentIndex !== -1 && currentIndex < playlist.songs.length - 1) {
//       const nextSong = playlist.songs[currentIndex + 1];
//       socket.emit('play music', {
//         roomName: room.name,
//         videoId: nextSong.videoId,
//         position: 0
//       });
//     }
//   };

//   const onPlayerReady = (event) => {
//     setPlayer(event.target);
//     if (playlist.currentSong && playlist.currentSong.isPlaying) {
//       event.target.loadVideoById(playlist.currentSong.videoId, playlist.currentSong.position || 0);
//     }
//   };

//   const onPlayerStateChange = (event) => {
//     if (!player || !room) return;

//     try {
//       const currentTime = player.getCurrentTime();
//       const timestamp = new Date();
//       lastStateChange.current = timestamp;

//       switch (event.data) {
//         case 1: // playing
//           socket.emit('play music', {
//             roomName: room.name,
//             videoId: player.getVideoData().video_id,
//             position: currentTime
//           });
//           break;
//         case 2: // paused
//           socket.emit('pause music', {
//             roomName: room.name,
//             position: currentTime
//           });
//           break;
//         case 0: // ended
//           skipSong();
//           break;
//       }
//     } catch (error) {
//       console.error('Player state change error:', error);
//     }
//   };

//   return (
//     <Card className="w-full max-w-4xl">
//       <CardHeader>
//         <CardTitle>Music Player</CardTitle>
//       </CardHeader>
//       <CardContent>
//         {apiError && (
//           <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
//             <p>{apiError}</p>
//           </div>
//         )}

//         <div className="mb-4">
//           {isLoading ? (
//             <div className="h-64 w-full flex items-center justify-center bg-gray-200">
//               <p>Loading player...</p>
//             </div>
//           ) : playlist.currentSong ? (
//             <div>
//               <YouTube
//                 videoId={playlist.currentSong.videoId}
//                 opts={{
//                   height: '300',
//                   width: '100%',
//                   playerVars: {
//                     controls: 1,
//                     autoplay: 1,
//                     origin: window.location.origin
//                   }
//                 }}
//                 onReady={onPlayerReady}
//                 onStateChange={onPlayerStateChange}
//               />
//               <div className="flex justify-center gap-4 mt-4">
//                 {player && (
//                   <>
//                     <button
//                       onClick={() => player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo()}
//                       className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
//                     >
//                       {player.getPlayerState() === 1 ? <Pause size={24} /> : <Play size={24} />}
//                     </button>
//                     <button
//                       onClick={skipSong}
//                       className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
//                       disabled={!playlist.songs.length}
//                     >
//                       <SkipForward size={24} />
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="h-64 w-full flex items-center justify-center bg-gray-200">
//               {/* <p>No current song</p> */}
//               <iframe
//               width="560"
//               height="315"
//               src={`https://www.youtube.com/embed/${searchResults?.videoId}`}
//               title="YouTube video player"
//               frameBorder="0"
//               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//               allowFullScreen
//             ></iframe>
//             </div>
//           )}
//         </div>

//         {(isAdmin || isDJ) && (
//           <div className="mb-4 space-y-4">
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => {
//                   setSearchQuery(e.target.value);
//                   if (e.target.value.trim()) {
//                     setIsSearching(true);
//                     searchVideos(e.target.value);
//                   } else {
//                     setIsSearching(false);
//                     setSearchResults([]);
//                   }
//                 }}
//                 placeholder="Search for songs..."
//                 className="flex-grow p-2 border rounded"
//               />
//               <button
//                 onClick={() => searchVideos(searchQuery)}
//                 className="px-4 py-2 bg-blue-500 text-white rounded"
//               >
//                 <Search size={20} />
//               </button>
//             </div>

//             {isSearching && searchResults.length > 0 && (
//               <div className="border rounded-md p-2 space-y-2">
//                 {searchResults.map((result) => (
//                   <div
//                     key={result.videoId}
//                     className="flex items-center justify-between p-2 hover:bg-gray-100 rounded"
//                   >
//                     <div className="flex items-center gap-2">
//                       <img
//                         src={result.thumbnail}
//                         alt={result.title}
//                         className="w-16 h-12 object-cover"
//                       />
//                       <span className="truncate">{result.title}</span>
//                     </div>
//                     <button
//                       onClick={() => addSong(result.videoId, result.title, result.thumbnail)}
//                       className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
//                     >
//                       Add
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         <div className="space-y-2">
//           <h3 className="font-bold text-lg">Playlist</h3>
//           {isLoading ? (
//             <p className="text-gray-500 italic">Loading playlist...</p>
//           ) : playlist.songs.length === 0 ? (
//             <p className="text-gray-500 italic">No songs in playlist</p>
//           ) : (
//             <div className="space-y-2">
//               {playlist.songs.map((song) => (
//                 <div key={song._id} className="flex items-center justify-between bg-white p-2 rounded border">
//                   <div className="flex items-center gap-2">
//                     <img
//                       src={song.thumbnail}
//                       alt={song.title}
//                       className="w-16 h-12 object-cover"
//                     />
//                     <div>
//                       <div className="font-medium truncate max-w-md">{song.title}</div>
//                       <div className="text-sm text-gray-500">Added by: {song.addedBy}</div>
//                     </div>
//                   </div>
//                   {(isAdmin || isDJ) && (
//                     <button
//                       onClick={() => removeSong(song._id)}
//                       className="px-3 py-1 text-red-500 hover:text-red-700"
//                     >
//                       Remove
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default MusicPlayer;