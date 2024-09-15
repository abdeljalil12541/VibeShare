import React from 'react';
import { useParams } from 'react-router-dom';
import Room from './Room'; // Your Room class component

export default function RoomWrapper() {
  const { roomCode } = useParams();
  return <Room roomCode={roomCode} />;
}
