'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Text, Stars, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface Omok3DProps {
    board: number[][];
    onCellClick: (x: number, y: number) => void;
    lastMove: { x: number, y: number } | null;
    myColor: 'black' | 'white';
    turn: 'black' | 'white';
}

const BOARD_SIZE = 15;
const CELL_SIZE = 1;
const BOARD_OFFSET = (BOARD_SIZE - 1) / 2; // 7

const Board = ({ onCellClick }: { onCellClick: (x: number, y: number) => void }) => {
    const dragStartRef = useRef<{ x: number, y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    return (
        <group>
            {/* Main Board Base */}
            <mesh receiveShadow position={[0, -0.5, 0]}>
                <boxGeometry args={[17, 1, 17]} />
                <meshStandardMaterial color="#e3cca8" roughness={0.5} metalness={0.1} />
            </mesh>

            {/* Grid Lines - constructed with thin planes for better visibility than Lines */}
            {Array.from({ length: 15 }).map((_, i) => {
                const pos = i - 7;
                return (
                    <group key={i}>
                        {/* Vertical Line */}
                        <mesh position={[pos, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <planeGeometry args={[0.05, 14]} />
                            <meshBasicMaterial color="#000000" opacity={0.5} transparent />
                        </mesh>
                        {/* Horizontal Line */}
                        <mesh position={[0, 0.01, pos]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
                            <planeGeometry args={[0.05, 14]} />
                            <meshBasicMaterial color="#000000" opacity={0.5} transparent />
                        </mesh>
                    </group>
                );
            })}

            {/* Interactive Raycast Plane (invisible) */}
            <mesh
                position={[0, 0.02, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                onPointerDown={(e) => {
                    dragStartRef.current = { x: e.clientX, y: e.clientY };
                    setIsDragging(false);
                }}
                onPointerMove={(e) => {
                    if (dragStartRef.current) {
                        const dx = e.clientX - dragStartRef.current.x;
                        const dy = e.clientY - dragStartRef.current.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance > 5) {
                            setIsDragging(true);
                        }
                    }
                }}
                onPointerUp={() => {
                    dragStartRef.current = null;
                }}
                onClick={(e) => {
                    // Prevent click if user was dragging
                    if (isDragging) {
                        e.stopPropagation();
                        setIsDragging(false);
                        return;
                    }

                    e.stopPropagation();
                    const x = Math.round(e.point.x + 7);
                    const z = Math.round(e.point.z + 7); // z is y in game logic

                    if (x >= 0 && x < 15 && z >= 0 && z < 15) {
                        onCellClick(x, z);
                    }
                }}
                visible={false}
            >
                <planeGeometry args={[15, 15]} />
            </mesh>

            {/* Star points (Hoshi) */}
            {[3, 7, 11].map(x => [3, 7, 11].map(z => (
                <mesh key={`${x}-${z}`} position={[x - 7, 0.02, z - 7]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.1, 32]} />
                    <meshBasicMaterial color="#000000" />
                </mesh>
            )))}
        </group>
    );
};

const Stone = ({ x, y, color, isLastMove }: { x: number, y: number, color: 1 | 2, isLastMove: boolean }) => {
    // Lowered Y position slightly to sit correctly on the board when flattened
    const position: [number, number, number] = [x - 7, 0.18, y - 7];

    return (
        <group position={position}>
            {/* Flattened sphere */}
            <mesh castShadow receiveShadow scale={[1, 0.6, 1]}>
                <sphereGeometry args={[0.42, 32, 32]} />
                <meshStandardMaterial
                    color={color === 1 ? '#1a1a1a' : '#f0f0f0'}
                    roughness={0.15}
                    metalness={0.15}
                />
            </mesh>
            {/* Shadow for stone */}
            <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.4, 32]} />
                <meshBasicMaterial color="#000000" opacity={0.3} transparent />
            </mesh>

            {isLastMove && (
                <mesh position={[0, 0.4, 0]}>
                    <sphereGeometry args={[0.1, 16, 16]} />
                    <meshBasicMaterial color="red" />
                </mesh>
            )}
        </group>
    );
};

const Omok3D = ({ board, onCellClick, lastMove, myColor, turn }: Omok3DProps) => {
    return (
        <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden shadow-2xl relative bg-slate-900/10">
            <Canvas shadows camera={{ position: [0, 10, 10], fov: 45 }}>
                <fog attach="fog" args={['#f0f0f0', 20, 60]} />
                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={1.5}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                />

                <Environment preset="city" />

                <group>
                    <Board onCellClick={onCellClick} />

                    {board?.flatMap((row, y) =>
                        row.map((cell, x) => {
                            if (cell === 0) return null;
                            const isLast = lastMove?.x === x && lastMove?.y === y;
                            return <Stone key={`${x}-${y}`} x={x} y={y} color={cell as 1 | 2} isLastMove={isLast} />;
                        })
                    )}
                </group>

                <ContactShadows position={[0, -0.51, 0]} opacity={0.4} scale={40} blur={2.5} far={4} />

                <OrbitControls
                    enablePan={false}
                    minDistance={2}
                    maxDistance={30}
                    maxPolarAngle={Math.PI / 2.1}
                    minPolarAngle={0.1}
                />
            </Canvas>

            <div className="absolute bottom-4 right-4 text-xs text-gray-500 pointer-events-none select-none bg-white/50 backdrop-blur px-2 py-1 rounded shadow-sm">
                3D View • Rotate & Zoom enabled
            </div>
        </div>
    );
};

export default Omok3D;
