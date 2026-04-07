import { useRef, useCallback, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import * as THREE from "three";
import { supabase } from "@/integrations/supabase/client";
import { useKeyboard } from "@/hooks/useKeyboard";
import GameMap from "@/components/GameMap";
import PlayerMesh from "@/components/PlayerMesh";
import FlagMesh from "@/components/FlagMesh";
import ScoreBoard from "@/components/ScoreBoard";
import QuestionModal from "@/components/QuestionModal";
import {
  MAP_SIZE, HALF_MAP, PLAYER_SPEED, CAPTURE_DISTANCE, TAG_DISTANCE,
  RED_FLAG_POS, BLUE_FLAG_POS, RED_BASE, BLUE_BASE,
  BROADCAST_INTERVAL, OBSTACLES, GAME_DURATION,
} from "@/game/constants";

interface RemotePlayer {
  id: string;
  session_id: string;
  player_name: string;
  team: "red" | "blue";
  pos: THREE.Vector3;
  has_flag: boolean;
  is_frozen: boolean;
}

interface GameSceneProps {
  sessionId: string;
  myPlayerId: string;
  roomId: string;
  team: "red" | "blue";
  playerName: string;
  onLeave: () => void;
}

// Camera follower component
function CameraFollow({ target }: { target: React.MutableRefObject<THREE.Vector3> }) {
  const { camera } = useThree();
  
  useFrame(() => {
    const t = target.current;
    const camTarget = new THREE.Vector3(t.x, t.y + 15, t.z + 20);
    camera.position.lerp(camTarget, 0.08);
    camera.lookAt(t.x, t.y, t.z);
  });

  return null;
}

function GameWorld({
  sessionId, myPlayerId, roomId, team, playerName,
  remotePlayers, myPos, myHasFlag, setShowQuestion, showQuestion,
  scores, timeLeft, onLeave,
}: GameSceneProps & {
  remotePlayers: RemotePlayer[];
  myPos: React.MutableRefObject<THREE.Vector3>;
  myHasFlag: boolean;
  setShowQuestion: (v: boolean) => void;
  showQuestion: boolean;
  scores: { red: number; blue: number };
  timeLeft: number;
}) {
  const keys = useKeyboard();
  const lastBroadcast = useRef(0);
  const posRef = myPos;

  // Check collision with obstacles
  const collidesObstacle = useCallback((x: number, z: number) => {
    const r = 1.2;
    for (const o of OBSTACLES) {
      const [ox, , oz] = o.pos;
      const [sx, , sz] = o.size;
      const hx = sx / 2 + r;
      const hz = sz / 2 + r;
      if (Math.abs(x - ox) < hx && Math.abs(z - oz) < hz) return true;
    }
    return false;
  }, []);

  useFrame((_, delta) => {
    if (showQuestion) return;

    const k = keys.current;
    const speed = PLAYER_SPEED * delta * 60;
    let dx = 0, dz = 0;
    if (k.forward) dz -= speed;
    if (k.backward) dz += speed;
    if (k.left) dx -= speed;
    if (k.right) dx += speed;

    if (dx !== 0 || dz !== 0) {
      const len = Math.sqrt(dx * dx + dz * dz);
      dx = (dx / len) * speed;
      dz = (dz / len) * speed;

      const nx = posRef.current.x + dx;
      const nz = posRef.current.z + dz;
      const clamped_x = Math.max(-HALF_MAP + 2, Math.min(HALF_MAP - 2, nx));
      const clamped_z = Math.max(-HALF_MAP + 2, Math.min(HALF_MAP - 2, nz));

      if (!collidesObstacle(clamped_x, clamped_z)) {
        posRef.current.x = clamped_x;
        posRef.current.z = clamped_z;
      }
    }

    // Broadcast position
    const now = Date.now();
    if (now - lastBroadcast.current > BROADCAST_INTERVAL) {
      lastBroadcast.current = now;
      supabase.channel(`room:${roomId}`).send({
        type: "broadcast",
        event: "player_move",
        payload: {
          session_id: sessionId,
          player_id: myPlayerId,
          player_name: playerName,
          team,
          x: posRef.current.x,
          y: posRef.current.y,
          z: posRef.current.z,
          has_flag: myHasFlag,
        },
      });
    }
  });

  // Determine flag visibility
  const redFlagVisible = !remotePlayers.some(p => p.team === "blue" && p.has_flag) && !myHasFlag;
  const blueFlagVisible = !remotePlayers.some(p => p.team === "red" && p.has_flag) && !(team === "red" && myHasFlag);
  // Correct: red flag visible if no blue player has it, blue flag visible if no red player has it
  const redFlagShow = !remotePlayers.some(p => p.team === "blue" && p.has_flag) && !(team === "blue" && myHasFlag);
  const blueFlagShow = !remotePlayers.some(p => p.team === "red" && p.has_flag) && !(team === "red" && myHasFlag);

  return (
    <>
      <CameraFollow target={posRef} />
      <Sky sunPosition={[100, 50, 100]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 80, 30]} intensity={1} castShadow />
      <hemisphereLight args={["#87ceeb", "#2d5a3d", 0.3]} />

      <GameMap />

      {/* Flags */}
      <FlagMesh position={[RED_FLAG_POS.x, RED_FLAG_POS.y, RED_FLAG_POS.z]} team="red" visible={redFlagShow} />
      <FlagMesh position={[BLUE_FLAG_POS.x, BLUE_FLAG_POS.y, BLUE_FLAG_POS.z]} team="blue" visible={blueFlagShow} />

      {/* My player */}
      <PlayerMesh
        position={[posRef.current.x, posRef.current.y, posRef.current.z]}
        team={team}
        isMe={true}
        hasFlag={myHasFlag}
        playerName={playerName}
        isFrozen={false}
      />

      {/* Remote players */}
      {remotePlayers.map((p) => (
        <PlayerMesh
          key={p.session_id}
          position={[p.pos.x, p.pos.y, p.pos.z]}
          team={p.team}
          isMe={false}
          hasFlag={p.has_flag}
          playerName={p.player_name}
          isFrozen={p.is_frozen}
        />
      ))}
    </>
  );
}

export default function GameScene({ sessionId, myPlayerId, roomId, team, playerName, onLeave }: GameSceneProps) {
  const startPos = team === "red" ? RED_BASE : BLUE_BASE;
  const myPos = useRef(new THREE.Vector3(startPos.x + (Math.random() - 0.5) * 10, 1, startPos.z + (Math.random() - 0.5) * 10));
  const [remotePlayers, setRemotePlayers] = useState<RemotePlayer[]>([]);
  const [showQuestion, setShowQuestion] = useState(false);
  const [myHasFlag, setMyHasFlag] = useState(false);
  const [scores, setScores] = useState({ red: 0, blue: 0 });
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const [taggedBy, setTaggedBy] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Realtime channel
  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "player_move" }, ({ payload }) => {
        if (payload.session_id === sessionId) return;
        setRemotePlayers(prev => {
          const existing = prev.find(p => p.session_id === payload.session_id);
          if (existing) {
            return prev.map(p =>
              p.session_id === payload.session_id
                ? { ...p, pos: new THREE.Vector3(payload.x, payload.y, payload.z), has_flag: payload.has_flag, is_frozen: payload.is_frozen || false }
                : p
            );
          }
          return [...prev, {
            id: payload.player_id,
            session_id: payload.session_id,
            player_name: payload.player_name,
            team: payload.team,
            pos: new THREE.Vector3(payload.x, payload.y, payload.z),
            has_flag: payload.has_flag,
            is_frozen: payload.is_frozen || false,
          }];
        });
      })
      .on("broadcast", { event: "flag_captured" }, ({ payload }) => {
        setScores({ red: payload.red_score, blue: payload.blue_score });
      })
      .on("broadcast", { event: "player_leave" }, ({ payload }) => {
        setRemotePlayers(prev => prev.filter(p => p.session_id !== payload.session_id));
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.send({ type: "broadcast", event: "player_leave", payload: { session_id: sessionId } });
      supabase.removeChannel(channel);
    };
  }, [roomId, sessionId]);

  // Game logic loop (flag pickup, tag detection)
  useEffect(() => {
    if (gameOver || showQuestion) return;
    const interval = setInterval(() => {
      const pos = myPos.current;

      // Flag pickup
      if (!myHasFlag) {
        const enemyFlagPos = team === "red" ? BLUE_FLAG_POS : RED_FLAG_POS;
        const dx = pos.x - enemyFlagPos.x;
        const dz = pos.z - enemyFlagPos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < CAPTURE_DISTANCE) {
          // Check no other teammate already has flag
          const teammatHasFlag = remotePlayers.some(p => p.team === team && p.has_flag);
          if (!teammatHasFlag) {
            setMyHasFlag(true);
          }
        }
      }

      // Flag capture (bring to own base)
      if (myHasFlag) {
        const myBase = team === "red" ? RED_BASE : BLUE_BASE;
        const dx = pos.x - myBase.x;
        const dz = pos.z - myBase.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < CAPTURE_DISTANCE) {
          const newScores = { ...scores };
          newScores[team]++;
          setScores(newScores);
          setMyHasFlag(false);
          
          // Update DB
          supabase.from("game_rooms").update({
            red_score: newScores.red,
            blue_score: newScores.blue,
          }).eq("id", roomId).then(() => {});

          // Broadcast
          channelRef.current?.send({
            type: "broadcast",
            event: "flag_captured",
            payload: { team, red_score: newScores.red, blue_score: newScores.blue },
          });
        }
      }

      // Tag detection (enemy in their territory)
      const inEnemyTerritory = team === "red" ? pos.x > 0 : pos.x < 0;
      if (inEnemyTerritory) {
        for (const enemy of remotePlayers) {
          if (enemy.team === team || enemy.is_frozen) continue;
          const dx = pos.x - enemy.pos.x;
          const dz = pos.z - enemy.pos.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < TAG_DISTANCE) {
            setTaggedBy(enemy.session_id);
            setShowQuestion(true);
            break;
          }
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [myHasFlag, remotePlayers, scores, team, roomId, gameOver, showQuestion]);

  const handleAnswer = useCallback((correct: boolean) => {
    setShowQuestion(false);
    setTaggedBy(null);
    if (!correct) {
      // Send back to base
      const base = team === "red" ? RED_BASE : BLUE_BASE;
      myPos.current.set(base.x + (Math.random() - 0.5) * 10, 1, base.z + (Math.random() - 0.5) * 10);
      setMyHasFlag(false);
    }
  }, [team]);

  const handleLeave = useCallback(() => {
    // Remove player from DB
    supabase.from("room_players").delete().eq("id", myPlayerId).then(() => {});
    onLeave();
  }, [myPlayerId, onLeave]);

  const redCount = remotePlayers.filter(p => p.team === "red").length + (team === "red" ? 1 : 0);
  const blueCount = remotePlayers.filter(p => p.team === "blue").length + (team === "blue" ? 1 : 0);

  if (gameOver) {
    const winner = scores.red > scores.blue ? "Rojo" : scores.blue > scores.red ? "Azul" : "Empate";
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 bg-card rounded-xl border border-border">
          <h1 className="font-pixel text-2xl text-accent mb-4">¡PARTIDA TERMINADA!</h1>
          <p className="text-foreground text-xl mb-2">
            {winner === "Empate" ? "¡Empate!" : `¡Equipo ${winner} gana!`}
          </p>
          <p className="text-muted-foreground mb-4">
            Rojo {scores.red} - {scores.blue} Azul
          </p>
          <button onClick={handleLeave} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold">
            Volver al Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
      <ScoreBoard
        redScore={scores.red}
        blueScore={scores.blue}
        timeLeft={timeLeft}
        redPlayers={redCount}
        bluePlayers={blueCount}
        roomCode=""
        myTeam={team}
      />

      {showQuestion && <QuestionModal onAnswer={handleAnswer} />}

      <Canvas shadows camera={{ position: [0, 20, 30], fov: 60 }}>
        <GameWorld
          sessionId={sessionId}
          myPlayerId={myPlayerId}
          roomId={roomId}
          team={team}
          playerName={playerName}
          onLeave={onLeave}
          remotePlayers={remotePlayers}
          myPos={myPos}
          myHasFlag={myHasFlag}
          setShowQuestion={setShowQuestion}
          showQuestion={showQuestion}
          scores={scores}
          timeLeft={timeLeft}
        />
      </Canvas>

      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={handleLeave}
          className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium text-sm"
        >
          Salir
        </button>
      </div>

      <div className="fixed bottom-4 right-4 z-40 text-xs text-muted-foreground bg-card/80 px-3 py-2 rounded-lg">
        <p>WASD / Flechas: Mover</p>
        <p>Roba la bandera enemiga y llévala a tu base</p>
        {myHasFlag && <p className="text-accent font-bold">⚑ ¡Llevas la bandera!</p>}
      </div>
    </div>
  );
}
