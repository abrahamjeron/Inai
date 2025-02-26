import React, { useEffect, useState } from "react";
import axios from "axios";

function RoomMembers({ roomId, leaveRoom, roomName, currentuserName,currentuserAvt }) {
    const [members, setMembers] = useState([]);
    const [memberData, setMemberData] = useState([]);
    const [creatorData, setCreatorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/rooms/${roomId}`);
                const roomData = response.data;

                // Fetch the creator's data
                const creatorResponse = await axios.get(`http://localhost:3001/users/${roomData.creator}`);
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
                        const response = await axios.get(`http://localhost:3001/users/${member}`);
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

    if (loading) return <p>Loading members...</p>;
    if (error) return <p>{error}</p>;

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
        <div>
            <div className='mt-7'>
                <div className='flex items-center ml-15'>
                    {creatorData && (
                        <div className='relative left-[20px]'>
                            <img className='h-[70px] w-[70px] rounded-full' src={creatorData.avatar || "default-image.jpg"} alt={creatorData.username} />
                        </div>
                    )}
                    {memberData.length > 0 && (
                        <div>
                            <img className='h-[70px] w-[70px] rounded-full' src={currentuserAvt || "default-image.jpg"} alt={memberData[0]?.username} />
                        </div>
                    )}
                </div>
                <div className='flex flex-col w-[280px] items-center mt-2'>
                    <h1 className='font-bold self-center text-[1.2rem]'>{roomName}</h1>
                    <p className='text-[#98A1B8] text-[0.9rem]'>{participants.length} Members</p>
                </div>
            </div>
            <div className="mt-5 -ml-1">
                <div className="w-[270px] max-w-md p-3">
                    <div className={`space-y-2 ${participants.length > 5 ? "max-h-[250px] rounded-2xl overflow-y-auto" : ""}`}>
                    {participants.map((participant, index) => (
    <div 
        key={`${participant.id}-${index}`} 
        className="flex items-center justify-between rounded-xl p-1 group hover:bg-gray-800 transition"
    >
        <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
                <img 
                    src={participant.avatar || "/placeholder.svg"} 
                    alt={participant.name} 
                    className="rounded-full object-cover w-full h-full" 
                />
            </div>
            <div>
                <h3 className="text-black group-hover:text-white font-semibold transition text-sm">
                    {participant.displayName}
                </h3>
                <p className="text-gray-400 text-xs group-hover:text-gray-300 transition">
                    {participant.role}
                </p>
            </div>
        </div>
        <button
            onClick={leaveRoom}
            className={`px-2 rounded-full text-xs font-medium transition
                ${participant.isHost 
                    ? 'bg-black text-white border border-white/20 group-hover:bg-white group-hover:text-black' 
                    : 'bg-black text-white border border-white/20 group-hover:bg-white group-hover:text-black'
                }`}
        >
            {participant.name === currentuserName ? 'Exit' : 'Remove'}
        </button>
    </div>
))}

                    </div>
                </div>
            </div>
            <button
                onClick={leaveRoom}
                className="bg-red-500 text-black w-[50px] p-1 mr-2 rounded text-xs"
            >
                Leave
            </button>
        </div>
    );
}

export default RoomMembers;
