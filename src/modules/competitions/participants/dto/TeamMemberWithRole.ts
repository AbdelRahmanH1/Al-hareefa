import { TeamMemberRole } from '@prisma/client';

export type TeamMemberWithRole = {
  playerId: bigint;
  roleInTeam: TeamMemberRole;
};
