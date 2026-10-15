export function canSendMessage(senderLevel: string, receiverLevel: string): boolean {
  // Min cannot message Min, Mix cannot message Mix.
  if (senderLevel === 'MIN' && receiverLevel === 'MIN') return false;
  if (senderLevel === 'MIX' && receiverLevel === 'MIX') return false;
  return true;
}
