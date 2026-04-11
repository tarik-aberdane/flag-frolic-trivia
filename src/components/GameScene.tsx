import { useRef, useCallback, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import * as THREE from "three";
import { supabase } from "@/integrations/supabase/client";
import { useMouseLook } from "@/hooks/useMouseLook";
import { useInputHandler } from "@/hooks/useInputHandler";
import GameMap from "@/components/GameMap";
import PlayerMesh from "@/components/PlayerMesh";
import FlagMesh from "@/components/FlagMesh";
import ScoreBoard from "@/components/ScoreBoard";
import StaminaBar from "@/components/StaminaBar";
import DuelModal from "@/components/DuelModal";
import ProximityPrompt from "@/components/ProximityPrompt";
import VictoryOverlay from "@/components/VictoryOverlay";
import VictoryCelebration from "@/components/VictoryCelebration";
import ThirdPersonCamera from "@/components/ThirdPersonCamera";
import PlayerController from "@/components/PlayerController";
import PowerUp3D from "@/components/PowerUp3D";
import { getRandomQuestion, SMXQuestion } from "@/game/questions";
import { getCharacterById, CharacterDef } from "@/game/characters";
import { createPowerUps, checkPowerUpPickup, PowerUpInstance, SPEED_BOOST_DURATION, SPEED_BOOST_MULTIPLIER } from "@/game/powerups";
import {
  HALF_MAP, CAPTURE_DISTANCE, TAG_DISTANCE,
  RED_FLAG_POS, BLUE_FLAG_POS, RED_BASE, BLUE_BASE,
  BROADCAST_INTERVAL, GAME_DURATION,
} from "@/game/constants";

/* ─── Types ─── */
interface RemotePlayer {
  id: string;
  session_id: string;
  player_name: string;
  team: "red" | "blue";
  pos: THREE.Vector3;
  targetPos: THREE.Vector3;
  has_flag: boolean;
  is_frozen: boolean;
  lastUpdate: number; // timestamp for stale detection
}

interface DuelState {
  question: SMXQuestion;
  opponentName: string;
  opponentSession: string;
  resolved: boolean;
  resolvedResult?: "won" | "lost";
}

interface GameSceneProps {
  sessionId: string;
  myPlayerId: string;
  roomId: string;
  team: "red" | "blue";
  playerName: string;
  characterId: string;
  onLeave: () => void;
}

/* ─── Inner 3D world ─── */
function GameWorld({
  sessionId, myPlayerId, roomId, team, playerName, character,
  remotePlayers, myPos, myHasFlag, inDuel,
  nearFlag, nearBase, showCelebration, celebrationPos,
  yaw, pitch, stamina, speedBoost, onStaminaChange,
  powerUps,
}: {
  sessionId: string; myPlayerId: string; roomId: string;
  team: "red" | "blue"; playerName: string; character: CharacterDef;
  remotePlayers: RemotePlayer[];
  myPos: React.MutableRefObject<THREE.Vector3>;
  myHasFlag: boolean; inDuel: boolean;
  nearFlag: boolean; nearBase: boolean;
  showCelebration: boolean; celebrationPos: [number, number, number];
  yaw: React.MutableRefObject<number>;
  pitch: React.MutableRefObject<number>;
  stamina: React.MutableRefObject<number>;
  speedBoost: React.MutableRefObject<number>;
  onStaminaChange: (v: number) => void;
  powerUps: PowerUpInstance[];
}) {
  const { keys } = useInputHandler();
  const headBob = useRef(0);
  const onHeadBob = useCallback((bob: number) => { headBob.current = bob; }, []);

  // Smooth interpolation for remote players each frame
  useFrame((_, delta) => {
    const lerpFactor = Math.min(1, delta * 10); // ~10x per second smoothing
    remotePlayers.forEach(p => {
      p.pos.lerp(p.targetPos, lerpFactor);
    });
  });

  return (
    <>
      <ThirdPersonCamera target={myPos} yaw={yaw} pitch={pitch} headBob={headBob} />
      <PlayerController
        myPos={myPos} yaw={yaw} keys={keys}
        disabled={inDuel} character={character}
        stamina={stamina} speedBoost={speedBoost}
        onHeadBob={onHeadBob} onStaminaChange={onStaminaChange}
      />
      <BroadcastLoop
        myPos={myPos} sessionId={sessionId} myPlayerId={myPlayerId}
        playerName={playerName} team={team} roomId={roomId} myHasFlag={myHasFlag}
        inDuel={inDuel}
      />

      <Sky sunPosition={[100, 50, 100]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 80, 30]} intensity={1} castShadow />
      <hemisphereLight args={["#87ceeb", "#2d5a3d", 0.3]} />
      <GameMap />

      <FlagMesh position={[RED_FLAG_POS.x, RED_FLAG_POS.y, RED_FLAG_POS.z]} team="red"
        visible={!remotePlayers.some(p => p.team === "blue" && p.has_flag) && !(team === "blue" && myHasFlag)} />
      <FlagMesh position={[BLUE_FLAG_POS.x, BLUE_FLAG_POS.y, BLUE_FLAG_POS.z]} team="blue"
        visible={!remotePlayers.some(p => p.team === "red" && p.has_flag) && !(team === "red" && myHasFlag)} />

      {nearFlag && !myHasFlag && (
        <mesh position={[team === "red" ? BLUE_FLAG_POS.x : RED_FLAG_POS.x, 0.15, team === "red" ? BLUE_FLAG_POS.z : RED_FLAG_POS.z]}>
          <ringGeometry args={[3, 4, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
      {nearBase && myHasFlag && (
        <mesh position={[team === "red" ? RED_BASE.x : BLUE_BASE.x, 0.15, team === "red" ? RED_BASE.z : BLUE_BASE.z]}>
          <ringGeometry args={[3, 4, 32]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}

      {powerUps.map(pu => (
        <PowerUp3D key={pu.id} position={pu.position} type={pu.type} active={pu.active} />
      ))}

      <VictoryCelebration position={celebrationPos} active={showCelebration} />

      <PlayerMesh
        position={[myPos.current.x, myPos.current.y, myPos.current.z]}
        team={team} isMe hasFlag={myHasFlag} playerName={playerName} isFrozen={false}
      />
      {remotePlayers.map(p => (
        <PlayerMesh
          key={p.session_id}
          position={[p.pos.x, p.pos.y, p.pos.z]}
          team={p.team} isMe={false} hasFlag={p.has_flag}
          playerName={p.player_name} isFrozen={p.is_frozen}
        />
      ))}
    </>
  );
}

/* ─── Broadcast: only sends position, no movement logic ─── */
function BroadcastLoop({ myPos, sessionId, myPlayerId, playerName, team, roomId, myHasFlag, inDuel }: {
  myPos: React.MutableRefObject<THREE.Vector3>;
  sessionId: string; myPlayerId: string; playerName: string;
  team: "red" | "blue"; roomId: string; myHasFlag: boolean; inDuel: boolean;
}) {
  const lastBroadcast = useRef(0);
  const lastPos = useRef(new THREE.Vector3());

  useFrame(() => {
    if (inDuel) return;
    const now = Date.now();
    if (now - lastBroadcast.current < BROADCAST_INTERVAL) return;

    // Only broadcast if position changed (reduces unnecessary network traffic)
    const moved = lastPos.current.distanceTo(myPos.current) > 0.05;
    if (!moved && now - lastBroadcast.current < 1000) return; // heartbeat every 1s even if idle

    lastBroadcast.current = now;
    lastPos.current.copy(myPos.current);

    supabase.channel(`room:${roomId}`).send({
      type: "broadcast", event: "player_move",
      payload: {
        session_id: sessionId, player_id: myPlayerId, player_name: playerName,
        team, x: myPos.current.x, y: myPos.current.y, z: myPos.current.z,
        has_flag: myHasFlag, is_frozen: false, t: now,
      },
    });
  });

  return null;
}

/* ─── Main scene wrapper ─── */
export default function GameScene({ sessionId, myPlayerId, roomId, team, playerName, characterId, onLeave }: GameSceneProps) {
  const character = getCharacterById(characterId);
  const startPos = team === "red" ? RED_BASE : BLUE_BASE;
  const myPos = useRef(new THREE.Vector3(startPos.x + (Math.random() - 0.5) * 10, 1, startPos.z + (Math.random() - 0.5) * 10));
  const stamina = useRef(character.maxStamina);
  const speedBoost = useRef(1.0);
  const [staminaDisplay, setStaminaDisplay] = useState(character.maxStamina);
  const [isSprinting, setIsSprinting] = useState(false);
  const [remotePlayers, setRemotePlayers] = useState<RemotePlayer[]>([]);
  const [myHasFlag, setMyHasFlag] = useState(false);
  const [scores, setScores] = useState({ red: 0, blue: 0 });
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const [duel, setDuel] = useState<DuelState | null>(null);
  const [nearFlag, setNearFlag] = useState(false);
  const [nearBase, setNearBase] = useState(false);
  const [ePressed, setEPressed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPos, setCelebrationPos] = useState<[number, number, number]>([0, 1, 0]);
  const [showVictoryOverlay, setShowVictoryOverlay] = useState(false);
  const [powerUps, setPowerUps] = useState<PowerUpInstance[]>(() => createPowerUps(6));
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const { yaw, pitch, requestLock } = useMouseLook();

  // Server time sync: fetch room started_at to calculate remaining time
  useEffect(() => {
    const syncTime = async () => {
      const { data } = await supabase.from("game_rooms").select("started_at, game_duration").eq("id", roomId).single();
      if (data?.started_at) {
        const elapsed = Math.floor((Date.now() - new Date(data.started_at).getTime()) / 1000);
        const remaining = Math.max(0, (data.game_duration || GAME_DURATION) - elapsed);
        setTimeLeft(remaining);
        if (remaining <= 0) setGameOver(true);
      }
    };
    syncTime();
  }, [roomId]);

  // E key handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key.toLowerCase() === "e") setEPressed(true); };
    const up = (e: KeyboardEvent) => { if (e.key.toLowerCase() === "e") setEPressed(false); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  // Global timer synced via broadcast
  useEffect(() => {
    if (gameOver) return;
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          // Broadcast game over to all players
          channelRef.current?.send({
            type: "broadcast", event: "game_over",
            payload: { reason: "time" },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [gameOver]);

  // Supabase channel
  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`, { config: { broadcast: { self: false } } });

    channel
      .on("broadcast", { event: "player_move" }, ({ payload }) => {
        if (payload.session_id === sessionId) return;
        setRemotePlayers(prev => {
          const idx = prev.findIndex(p => p.session_id === payload.session_id);
          const targetPos = new THREE.Vector3(payload.x, payload.y, payload.z);
          const now = Date.now();
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], targetPos, has_flag: payload.has_flag, is_frozen: payload.is_frozen || false, lastUpdate: now };
            return next;
          }
          return [...prev, {
            id: payload.player_id, session_id: payload.session_id,
            player_name: payload.player_name, team: payload.team,
            pos: targetPos.clone(), targetPos, lastUpdate: now,
            has_flag: payload.has_flag, is_frozen: payload.is_frozen || false,
          }];
        });
      })
      .on("broadcast", { event: "flag_captured" }, ({ payload }) => {
        setScores({ red: payload.red_score, blue: payload.blue_score });
      })
      .on("broadcast", { event: "player_leave" }, ({ payload }) => {
        setRemotePlayers(prev => prev.filter(p => p.session_id !== payload.session_id));
      })
      .on("broadcast", { event: "game_over" }, () => {
        setGameOver(true);
        setTimeLeft(0);
      })
      .on("broadcast", { event: "time_sync" }, ({ payload }) => {
        // Accept server time sync from room host
        if (payload.timeLeft !== undefined) {
          setTimeLeft(payload.timeLeft);
        }
      })
      .on("broadcast", { event: "duel_start" }, ({ payload }) => {
        if (payload.player_a === sessionId || payload.player_b === sessionId) {
          const opSession = payload.player_a === sessionId ? payload.player_b : payload.player_a;
          const opName = payload.player_a === sessionId ? payload.name_b : payload.name_a;
          setDuel({ question: payload.question, opponentName: opName, opponentSession: opSession, resolved: false });
        }
      })
      .on("broadcast", { event: "duel_answer" }, ({ payload }) => {
        if (payload.answerer !== sessionId && duel) {
          if (payload.correct) {
            setDuel(prev => prev ? { ...prev, resolved: true, resolvedResult: "lost" } : null);
            setTimeout(() => { sendToBase(); setDuel(null); }, 1500);
          } else {
            setDuel(prev => prev ? { ...prev, resolved: true, resolvedResult: "won" } : null);
            setTimeout(() => setDuel(null), 1500);
          }
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      channel.send({ type: "broadcast", event: "player_leave", payload: { session_id: sessionId } });
      supabase.removeChannel(channel);
    };
  }, [roomId, sessionId]);

  // Clean stale remote players (no update in 5s)
  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now();
      setRemotePlayers(prev => prev.filter(p => now - p.lastUpdate < 5000));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  const sendToBase = useCallback(() => {
    const base = team === "red" ? RED_BASE : BLUE_BASE;
    myPos.current.set(base.x + (Math.random() - 0.5) * 10, 1, base.z + (Math.random() - 0.5) * 10);
    if (myHasFlag) {
      setMyHasFlag(false);
    }
  }, [team, myHasFlag]);

  // Game logic loop - runs at 60fps via requestAnimationFrame for instant collision detection
  useEffect(() => {
    if (gameOver || duel) return;
    let rafId: number;

    const gameLoop = () => {
      const pos = myPos.current;
      const enemyFlagPos = team === "red" ? BLUE_FLAG_POS : RED_FLAG_POS;
      const myBase = team === "red" ? RED_BASE : BLUE_BASE;

      const distToFlag = Math.sqrt((pos.x - enemyFlagPos.x) ** 2 + (pos.z - enemyFlagPos.z) ** 2);
      const distToBase = Math.sqrt((pos.x - myBase.x) ** 2 + (pos.z - myBase.z) ** 2);
      setNearFlag(distToFlag < CAPTURE_DISTANCE + 4 && !myHasFlag);
      setNearBase(distToBase < CAPTURE_DISTANCE + 4 && myHasFlag);

      // Flag pickup
      if (!myHasFlag && distToFlag < CAPTURE_DISTANCE && ePressed) {
        const teammateHasFlag = remotePlayers.some(p => p.team === team && p.has_flag);
        if (!teammateHasFlag) { setMyHasFlag(true); setEPressed(false); }
      }

      // Flag delivery
      if (myHasFlag && distToBase < CAPTURE_DISTANCE && ePressed) {
        const newScores = { ...scores, [team]: scores[team] + 1 };
        setScores(newScores);
        setMyHasFlag(false);
        setEPressed(false);

        setCelebrationPos([pos.x, pos.y, pos.z]);
        setShowCelebration(true);
        setShowVictoryOverlay(true);
        setTimeout(() => setShowCelebration(false), 2500);

        supabase.from("game_rooms").update({
          red_score: newScores.red, blue_score: newScores.blue,
        }).eq("id", roomId).then(() => {});

        channelRef.current?.send({
          type: "broadcast", event: "flag_captured",
          payload: { team, red_score: newScores.red, blue_score: newScores.blue },
        });
      }

      // Power-up pickup
      const { pickedUp, updated } = checkPowerUpPickup(pos.x, pos.z, powerUps);
      if (pickedUp) {
        setPowerUps(updated);
        speedBoost.current = SPEED_BOOST_MULTIPLIER;
        setTimeout(() => { speedBoost.current = 1.0; }, SPEED_BOOST_DURATION);
      } else {
        const now = Date.now();
        const hasRespawn = powerUps.some(pu => !pu.active && pu.respawnAt > 0 && now >= pu.respawnAt);
        if (hasRespawn) {
          setPowerUps(prev => prev.map(pu => (!pu.active && pu.respawnAt > 0 && now >= pu.respawnAt) ? { ...pu, active: true, respawnAt: 0 } : pu));
        }
      }

      // Instant client-side duel detection
      const inEnemyTerritory = team === "red" ? pos.x > 0 : pos.x < 0;
      if (inEnemyTerritory && !duel) {
        for (const enemy of remotePlayers) {
          if (enemy.team === team || enemy.is_frozen) continue;
          const d = Math.sqrt((pos.x - enemy.pos.x) ** 2 + (pos.z - enemy.pos.z) ** 2);
          if (d < TAG_DISTANCE) {
            if (sessionId < enemy.session_id) {
              const q = getRandomQuestion();
              // Immediately show duel locally (no server round-trip)
              setDuel({ question: q, opponentName: enemy.player_name, opponentSession: enemy.session_id, resolved: false });
              // Then broadcast to opponent
              channelRef.current?.send({
                type: "broadcast", event: "duel_start",
                payload: { player_a: sessionId, player_b: enemy.session_id, name_a: playerName, name_b: enemy.player_name, question: q },
              });
            }
            break;
          }
        }
      }

      setIsSprinting(stamina.current < character.maxStamina && stamina.current > 0);
      rafId = requestAnimationFrame(gameLoop);
    };

    rafId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafId);
  }, [myHasFlag, remotePlayers, scores, team, roomId, gameOver, duel, ePressed, sessionId, playerName, powerUps, character]);

  const handleDuelAnswer = useCallback((correct: boolean) => {
    channelRef.current?.send({ type: "broadcast", event: "duel_answer", payload: { answerer: sessionId, correct } });
    if (!correct) {
      setTimeout(() => { sendToBase(); setDuel(null); }, 1000);
    } else {
      setTimeout(() => setDuel(null), 1000);
    }
  }, [sessionId, sendToBase]);

  // Duel timeout: auto-lose after 20s
  useEffect(() => {
    if (!duel || duel.resolved) return;
    const timeout = setTimeout(() => {
      sendToBase();
      setDuel(null);
    }, 20000);
    return () => clearTimeout(timeout);
  }, [duel, sendToBase]);

  const handleLeave = useCallback(() => {
    supabase.from("room_players").delete().eq("id", myPlayerId).then(() => {});
    onLeave();
  }, [myPlayerId, onLeave]);

  const redCount = remotePlayers.filter(p => p.team === "red").length + (team === "red" ? 1 : 0);
  const blueCount = remotePlayers.filter(p => p.team === "blue").length + (team === "blue" ? 1 : 0);

  if (gameOver) {
    const winner = scores.red > scores.blue ? "Rojo" : scores.blue > scores.red ? "Azul" : "Empate";
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 bg-card rounded-xl border border-border animate-scale-in">
          <h1 className="font-pixel text-2xl text-accent mb-4">¡PARTIDA TERMINADA!</h1>
          <p className="text-foreground text-xl mb-2">
            {winner === "Empate" ? "¡Empate!" : `¡Equipo ${winner} gana!`}
          </p>
          <p className="text-muted-foreground mb-4">Rojo {scores.red} - {scores.blue} Azul</p>
          <button onClick={handleLeave} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold">
            Volver al Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative" onClick={requestLock}>
      <ScoreBoard
        redScore={scores.red} blueScore={scores.blue} timeLeft={timeLeft}
        redPlayers={redCount} bluePlayers={blueCount} roomCode="" myTeam={team}
      />

      <StaminaBar current={staminaDisplay} max={character.maxStamina} isSprinting={isSprinting} />

      {speedBoost.current > 1 && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-40 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-bold animate-pulse">
          ⚡ VELOCIDAD AUMENTADA
        </div>
      )}

      {duel && (
        <DuelModal
          question={duel.question} opponentName={duel.opponentName}
          onAnswer={handleDuelAnswer} timeLimit={15}
          resolved={duel.resolved} resolvedResult={duel.resolvedResult}
        />
      )}

      <ProximityPrompt label="Recoger bandera" visible={nearFlag && !myHasFlag && !duel} />
      <ProximityPrompt label="Entregar bandera en base" visible={nearBase && myHasFlag && !duel} />
      <VictoryOverlay show={showVictoryOverlay} team={team} />

      <Canvas shadows camera={{ position: [0, 20, 30], fov: 60, near: 0.5, far: 500 }}>
        <GameWorld
          sessionId={sessionId} myPlayerId={myPlayerId} roomId={roomId}
          team={team} playerName={playerName} character={character}
          remotePlayers={remotePlayers} myPos={myPos}
          myHasFlag={myHasFlag} inDuel={!!duel}
          nearFlag={nearFlag} nearBase={nearBase}
          showCelebration={showCelebration} celebrationPos={celebrationPos}
          yaw={yaw} pitch={pitch}
          stamina={stamina} speedBoost={speedBoost}
          onStaminaChange={setStaminaDisplay}
          powerUps={powerUps}
        />
      </Canvas>

      <div className="fixed bottom-4 left-4 z-40">
        <button onClick={handleLeave} className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium text-sm">
          Salir
        </button>
      </div>

      <div className="fixed bottom-4 right-4 z-40 text-xs text-muted-foreground bg-card/80 px-3 py-2 rounded-lg">
        <p>WASD: Mover | Shift: Sprint | Espacio: Saltar</p>
        <p>Ratón: Cámara | E: Recoger/Entregar bandera</p>
        <p className="text-muted-foreground/60">Click para activar cámara</p>
        {myHasFlag && <p className="text-accent font-bold">⚑ ¡Llevas la bandera!</p>}
      </div>
    </div>
  );
}
