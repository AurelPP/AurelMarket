-- CreateTable
CREATE TABLE "PokemonListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exportUuid" TEXT,
    "fingerprint" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "nickname" TEXT,
    "level" INTEGER NOT NULL,
    "shiny" BOOLEAN NOT NULL,
    "gender" TEXT,
    "ability" TEXT,
    "nature" TEXT,
    "friendship" INTEGER,
    "caughtBall" TEXT,
    "current_hp" INTEGER,
    "max_hp" INTEGER,
    "hp" INTEGER,
    "atk" INTEGER,
    "def" INTEGER,
    "spa" INTEGER,
    "spd" INTEGER,
    "spe" INTEGER,
    "iv_hp" INTEGER,
    "iv_atk" INTEGER,
    "iv_def" INTEGER,
    "iv_spa" INTEGER,
    "iv_spd" INTEGER,
    "iv_spe" INTEGER,
    "ev_hp" INTEGER,
    "ev_atk" INTEGER,
    "ev_def" INTEGER,
    "ev_spa" INTEGER,
    "ev_spd" INTEGER,
    "ev_spe" INTEGER,
    "movesJson" TEXT NOT NULL,
    "rawJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PokemonListing_exportUuid_key" ON "PokemonListing"("exportUuid");

-- CreateIndex
CREATE UNIQUE INDEX "PokemonListing_fingerprint_key" ON "PokemonListing"("fingerprint");
