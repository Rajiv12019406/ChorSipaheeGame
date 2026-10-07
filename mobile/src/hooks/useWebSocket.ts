import {useEffect} from 'react';
import {useGameStore} from '../store/gameStore';
import {gameSocket} from '../api/websocket';

/**
 * Ensures the GameSocket is bound to the Zustand store for the app lifetime.
 */
export function useWebSocket(): {
  connectionStatus: ReturnType<typeof useGameStore.getState>['connectionStatus'];
  connect: () => Promise<boolean>;
  disconnect: () => void;
  reconnect: () => void;
  error: string | null;
} {
  const connectionStatus = useGameStore(s => s.connectionStatus);
  const connect = useGameStore(s => s.connect);
  const disconnect = useGameStore(s => s.disconnect);
  const error = useGameStore(s => s.error);
  const bindSocket = useGameStore(s => s.bindSocket);

  useEffect(() => {
    bindSocket();
  }, [bindSocket]);

  return {
    connectionStatus,
    connect,
    disconnect,
    reconnect: () => gameSocket.reconnect(),
    error,
  };
}
