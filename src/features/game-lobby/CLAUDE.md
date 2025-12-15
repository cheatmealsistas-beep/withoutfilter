# Feature: Game Lobby

## Descripción
Gestión de salas de juego para Without Filter. Incluye crear salas, unirse por código, configuración de partida y sistema de presencia en tiempo real.

## Estructura de Archivos

```
/src/features/game-lobby/
├── CLAUDE.md                    # Este archivo
├── types/index.ts               # Zod schemas + TypeScript types
├── game-lobby.query.ts          # SELECT operations
├── game-lobby.command.ts        # INSERT/UPDATE/DELETE operations
├── game-lobby.handler.ts        # Business logic + validation
├── game-lobby.actions.ts        # Server Actions
├── hooks/
│   └── use-room-presence.ts     # Real-time presence hook
├── components/                   # UI components (pending)
│   ├── create-room-form.tsx
│   ├── join-room-form.tsx
│   ├── player-list.tsx
│   └── room-config.tsx
└── index.ts                     # Public exports
```

## Dependencias

- Supabase (game_rooms, game_players tables)
- Supabase Realtime (Presence channels)
- `@/shared/auth` para obtener usuario autenticado (opcional)

## Flujos Principales

### Crear Sala
1. Usuario llena CreateRoomForm (nombre, emoji, config opcional)
2. `createRoomAction` → `handleCreateRoom`
3. Crea registro en `game_rooms` (código auto-generado)
4. Crea registro en `game_players` (host)
5. Redirect a `/game/[code]`

### Unirse a Sala
1. Usuario llena JoinRoomForm (código, nombre, emoji)
2. `joinRoomAction` → `handleJoinRoom`
3. Valida que sala existe y es joinable
4. Crea registro en `game_players`
5. Redirect a `/game/[code]`

### Presencia en Tiempo Real
- Hook `useRoomPresence` maneja Supabase Presence
- Detecta automáticamente conexiones/desconexiones
- Sincroniza estado `isReady` entre jugadores

## Tipos Clave

```typescript
type RoomConfig = {
  categories: ('suave' | 'atrevida' | 'sin_filtro')[];
  intensity: number;
  maxPlayers: number;
  minPlayers: number;
  roundsPerGame: number;
  timePerRound: number;
  allowLateJoin: boolean;
};

type Player = {
  id: string;
  room_id: string;
  user_id: string | null;
  display_name: string;
  avatar_emoji: string;
  is_host: boolean;
  is_ready: boolean;
  is_connected: boolean;
  score: number;
};
```

## Testing Checklist

- [ ] Crear sala genera código único de 6 caracteres
- [ ] Host se añade automáticamente como jugador
- [ ] Unirse con código inválido muestra error
- [ ] Sala llena rechaza nuevos jugadores
- [ ] Presencia detecta desconexiones
- [ ] Solo host puede cambiar configuración
- [ ] Solo host puede expulsar jugadores

## Troubleshooting

**"No se pudo crear la sala"**:
- Verificar conexión a Supabase
- Revisar RLS policies en `game_rooms`

**"Presencia no funciona"**:
- Verificar que tabla está en `supabase_realtime` publication
- Revisar consola de Supabase para errores de Realtime

**"Código de sala no encontrado"**:
- El código es case-insensitive (se convierte a uppercase)
- Verificar que la sala no haya sido abandonada
