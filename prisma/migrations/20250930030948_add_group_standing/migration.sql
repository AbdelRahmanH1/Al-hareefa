-- CreateTable
CREATE TABLE "public"."GroupStanding" (
    "id" BIGSERIAL NOT NULL,
    "group_id" BIGINT NOT NULL,
    "participant_id" BIGINT NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "goals_for" INTEGER NOT NULL DEFAULT 0,
    "goals_against" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GroupStanding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupStanding_group_id_participant_id_key" ON "public"."GroupStanding"("group_id", "participant_id");

-- AddForeignKey
ALTER TABLE "public"."GroupStanding" ADD CONSTRAINT "GroupStanding_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."CompetitionGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroupStanding" ADD CONSTRAINT "GroupStanding_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "public"."Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
