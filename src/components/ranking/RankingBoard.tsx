'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Medal } from 'lucide-react';

interface RankingUser {
    userName: string;
    tier: string;
    tierLevel: number;
    points: number;
    wins: number;
    losses: number;
}

const RankingBoard = () => {
    const [activeTab, setActiveTab] = useState<'omok' | 'chess'>('omok');
    const [rankings, setRankings] = useState<RankingUser[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRankings();
    }, [activeTab]);

    const fetchRankings = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/ranking/leaderboard/${activeTab}`);
            setRankings(response.data);
        } catch (error) {
            console.error('Failed to fetch rankings', error);
        } finally {
            setLoading(false);
        }
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'Champion': return 'text-red-500 font-extrabold';
            case 'Diamond': return 'text-blue-400 font-bold';
            case 'Gold': return 'text-yellow-500 font-bold';
            case 'Silver': return 'text-gray-400 font-bold';
            case 'Bronze': return 'text-orange-700 font-bold';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-300" />
                    <h2 className="text-2xl font-bold">Leaderboard</h2>
                </div>
                <div className="flex bg-white/20 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('omok')}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'omok' ? 'bg-white text-indigo-600 shadow-sm' : 'text-white/70 hover:text-white'
                            }`}
                    >
                        Omok
                    </button>
                    <button
                        onClick={() => setActiveTab('chess')}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'chess' ? 'bg-white text-indigo-600 shadow-sm' : 'text-white/70 hover:text-white'
                            }`}
                    >
                        Chess
                    </button>
                </div>
            </div>

            <div className="p-0">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-4">Player</div>
                    <div className="col-span-3 text-center">Tier</div>
                    <div className="col-span-2 text-center">Points</div>
                    <div className="col-span-2 text-center">Win Rate</div>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-gray-500">Loading rankings...</div>
                ) : (
                    <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
                        {rankings.map((user, index) => {
                            const totalGames = user.wins + user.losses;
                            const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0;

                            return (
                                <div
                                    key={index}
                                    className="grid grid-cols-12 gap-4 p-4 border-b border-gray-50 hover:bg-indigo-50/30 transition-colors items-center"
                                >
                                    <div className="col-span-1 flex justify-center">
                                        {index < 3 ? (
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-md ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : 'bg-orange-400'
                                                }`}>
                                                {index + 1}
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 font-semibold">{index + 1}</span>
                                        )}
                                    </div>
                                    <div className="col-span-4 font-medium text-gray-800 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs">
                                            {user.userName.substring(0, 2).toUpperCase()}
                                        </div>
                                        {user.userName}
                                    </div>
                                    <div className={`col-span-3 text-center text-sm ${getTierColor(user.tier)}`}>
                                        {user.tier} {user.tier !== 'Unranked' && user.tier !== 'Champion' && user.tierLevel}
                                    </div>
                                    <div className="col-span-2 text-center font-mono text-gray-600">
                                        {user.points.toLocaleString()}
                                    </div>
                                    <div className="col-span-2 text-center text-sm text-gray-600">
                                        {winRate}% <span className="text-xs text-gray-400">({user.wins}W)</span>
                                    </div>
                                </div>
                            );
                        })}
                        {rankings.length === 0 && (
                            <div className="p-10 text-center text-gray-400">No rankings available yet.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RankingBoard;
