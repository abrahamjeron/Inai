import React, { useEffect, useState } from "react";
import axios from "axios";

function RoomMembers({ roomId }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/rooms/${roomId}`);
                setMembers(response.data.members);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch members");
                setLoading(false);
            }
        };

        fetchMembers();
    }, [roomId]);

    if (loading) return <p>Loading members...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="p-4 bg-white rounded-2xl shadow-md w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Room Members</h2>
            {members.length > 0 ? (
                <ul className="list-disc pl-6">
                    {members.map((member, index) => (
                        <li key={index} className="text-gray-800">
                            {member}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No members in this room</p>
            )}
        </div>
    );
}

export default RoomMembers;
