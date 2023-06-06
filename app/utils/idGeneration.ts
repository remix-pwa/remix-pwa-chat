import {  } from "bcryptjs";
export const generateConversationId = (currentId: string, otherId: string): string => {
  const firstLength = currentId.length;
  const secondLength = otherId.length;

  return `${otherId}_${firstLength}_${currentId}_${secondLength}`
}

export const decrypytConversationId = (conversationId: string): [string, string] => {
  const [firstId,, secondId, ] = conversationId.split('_');

  return [secondId, firstId];
}