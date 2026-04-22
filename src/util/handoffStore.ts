interface HandoffEntry {
  token: string;
  expiresAt: number;
}

const handoffStore = new Map<string, HandoffEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of handoffStore.entries()) {
    if (now > entry.expiresAt) handoffStore.delete(code);
  }
}, 60_000);

export default handoffStore;