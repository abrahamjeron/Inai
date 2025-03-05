import React, { useEffect, useState } from "react";
import axios from "axios";
const backend_url = import.meta.env.VITE_BACKEND_URL

function RoomMembers({ roomId, leaveRoom, roomName, currentuserName, currentuserAvt }) {
    const [members, setMembers] = useState([]);
    const [memberData, setMemberData] = useState([]);
    const [creatorData, setCreatorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const response = await axios.get(`${backend_url}/rooms/${roomId}`);
                const roomData = response.data;

                // Fetch the creator's data
                const creatorResponse = await axios.get(`${backend_url}/users/${roomData.creator}`);
                setCreatorData(creatorResponse.data);

                // Filter out null/undefined members and exclude creator
                const filteredMembers = roomData.members.filter(
                    (member) => member && member !== roomData.creator
                );
                setMembers(filteredMembers);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch members");
                setLoading(false);
            }
        };

        fetchRoomData();
    }, [roomId]);

    useEffect(() => {
        const displayMembersData = async () => {
            try {
                const memberDetails = await Promise.all(
                    members.map(async (member) => {
                        const response = await axios.get(`${backend_url}/users/${member}`);
                        return response.data;
                    })
                );
                setMemberData(memberDetails);
            } catch (err) {
                console.log("Failed to fetch member details");
            }
        };

        if (members.length > 0) {
            displayMembersData();
        }
    }, [members]);

    const truncateName = (name, maxLength = 13) => {
        return name.length > maxLength ? name.slice(0, maxLength) + "..." : name;
    };

    if (loading) return <p className="p-4 text-center">Loading members...</p>;
    if (error) return <p className="p-4 text-center text-red-500">{error}</p>;

    // Create participants list
    let participants = [];

    // Add Creator
    if (creatorData) {
        participants.push({
            id: creatorData.id,
            name: creatorData.username,
            displayName: truncateName(creatorData.username),
            avatar: creatorData.avatar,
            role: 'Creator',
            isHost: true
        });
    }

    // Add Members
    memberData.forEach(member => {
        participants.push({
            id: member.id,
            name: member.username,
            displayName: truncateName(member.username),
            avatar: member.avatar,
            role: 'Member',
            isHost: false
        });
    });

    // Move current user to the front
    participants = participants.sort((a, b) => {
        if (a.name === currentuserName) return -1;
        if (b.name === currentuserName) return 1;
        return 0;
    });

    // Remove duplicates
    participants = participants.filter(
        (participant, index, self) =>
            index === self.findIndex((p) => p.name === participant.name)
    );

    return (
        <div className="bg-white p-2 md:p-0 rounded-lg md:rounded-none shadow md:shadow-none w-full md:w-auto md:min-w-[270px]">
            <div className="mt-3 md:mt-7">
                <div className="flex items-center justify-center md:justify-start md:ml-15">
                    {creatorData && (
                        <div className="relative md:left-[20px]">
                            <img 
                                className="h-10 w-10 md:h-[70px] md:w-[70px] rounded-full object-cover" 
                                src={creatorData.avatar || "default-image.jpg"} 
                                alt={creatorData.username} 
                            />
                        </div>
                    )}
                    {memberData.length > 0 && (
                        <div className="ml-2">
                            <img 
                                className="h-10 w-10 md:h-[70px] md:w-[70px] rounded-full object-cover" 
                                src={currentuserAvt || "default-image.jpg"} 
                                alt={memberData[0]?.username} 
                            />
                        </div>
                    )}
                </div>
                <div className="flex flex-col w-full md:w-[280px] items-center mt-2">
                    <h1 className="font-bold self-center text-base md:text-[1.2rem]">{roomName}</h1>
                    <p className="text-[#98A1B8] text-sm md:text-[0.9rem]">{participants.length} Members</p>
                </div>
            </div>
            <div className="mt-3 md:mt-5 -ml-0 md:-ml-1">
                <div className="w-full md:w-[270px] max-w-md p-2 md:p-3">
                    <div className={`space-y-2 ${participants.length > 5 ? "max-h-[200px] md:max-h-[250px] rounded-2xl overflow-y-auto" : ""}`}>
                        {participants.map((participant, index) => (
                            <div 
                                key={`${participant.id}-${index}`} 
                                className="flex items-center justify-between rounded-xl p-2 group hover:bg-gray-100 transition"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="relative w-8 h-8 md:w-10 md:h-10">
                                        <img 
                                            src={participant.avatar || "/placeholder.svg"} 
                                            alt={participant.name} 
                                            className="rounded-full object-cover w-full h-full" 
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-black group-hover:text-gray-700 font-semibold text-sm md:text-base">
                                            {participant.displayName}
                                        </h3>
                                        <p className="text-gray-500 text-xs md:text-sm">
                                            {participant.role}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={participant.name === currentuserName ? leaveRoom : () => {}}
                                    className={`px-2 py-1 rounded-full text-xs font-medium transition
                                        ${participant.isHost 
                                            ? 'bg-black text-white hover:bg-gray-800' 
                                            : 'bg-gray-200 text-black hover:bg-gray-300'
                                        }`}
                                >
                                    {participant.name === currentuserName ? 'Exit' : 'Remove'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex justify-center md:justify-start md:ml-3 mt-2">
                <button
                    onClick={leaveRoom}
                    className="bg-red-500 text-white w-[100px] md:w-[120px] p-2 rounded text-sm"
                >
                    Leave Room
                </button>
            </div>
        </div>
    );
}

export default RoomMembers;