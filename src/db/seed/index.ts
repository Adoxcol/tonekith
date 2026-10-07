import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { normalizeName, toSlug } from "@/lib/slug";

async function upsertUser(input: {
  id: string;
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
  bio?: string;
}) {
  const existing = await db.select().from(schema.users).where(eq(schema.users.email, input.email)).limit(1);
  if (existing[0]) return existing[0];

  const [user] = await db
    .insert(schema.users)
    .values({
      id: input.id,
      name: input.name,
      email: input.email,
      emailVerified: true,
      role: input.role ?? "user",
    })
    .returning();

  await db.insert(schema.accounts).values({
    id: `acct_${input.id}`,
    accountId: input.id,
    providerId: "credential",
    userId: user.id,
    password: await hashPassword(input.password),
  });

  await db.insert(schema.profiles).values({
    userId: user.id,
    displayName: input.name,
    bio: input.bio ?? null,
    allowDatasetUse: true,
    allowAudioTrainingUse: false,
  });

  return user;
}

async function main() {
  console.log("Seeding...");

  const admin = await upsertUser({
    id: "user_admin",
    name: "Admin",
    email: "admin@tone.local",
    password: "password123",
    role: "admin",
    bio: "Platform admin",
  });

  const maya = await upsertUser({
    id: "user_maya",
    name: "Maya Chen",
    email: "maya@tone.local",
    password: "password123",
    bio: "Bedroom producer chasing CAS & shoegaze tones.",
  });

  const diego = await upsertUser({
    id: "user_diego",
    name: "Diego Ruiz",
    email: "diego@tone.local",
    password: "password123",
    bio: "Amp-in-the-room guy. Blackstar loyalist.",
  });

  const priya = await upsertUser({
    id: "user_priya",
    name: "Priya Shah",
    email: "priya@tone.local",
    password: "password123",
    bio: "Neural DSP / plugin stack explorer.",
  });

  const artistData = [
    {
      name: "Cigarettes After Sex",
      slug: "cigarettes-after-sex",
      description: "Dreamy, reverb-soaked slowcore.",
      songs: [
        { title: "Apocalypse", slug: "apocalypse", album: "Cigarettes After Sex", year: 2017 },
        { title: "K.", slug: "k", album: "Cigarettes After Sex", year: 2017 },
        { title: "Touch", slug: "touch", album: "I.", year: 2012 },
      ],
    },
    {
      name: "Deftones",
      slug: "deftones",
      description: "Atmospheric alternative metal.",
      songs: [
        { title: "Change (In the House of Flies)", slug: "change", album: "White Pony", year: 2000 },
        { title: "Sextape", slug: "sextape", album: "Diamond Eyes", year: 2010 },
      ],
    },
    {
      name: "Radiohead",
      slug: "radiohead",
      description: "Experimental rock.",
      songs: [
        { title: "Weird Fishes/Arpeggi", slug: "weird-fishes", album: "In Rainbows", year: 2007 },
        { title: "Creep", slug: "creep", album: "Pablo Honey", year: 1992 },
      ],
    },
    {
      name: "Pixies",
      slug: "pixies",
      description: "Loud-quiet-loud indie pioneers.",
      songs: [
        { title: "Where Is My Mind?", slug: "where-is-my-mind", album: "Surfer Rosa", year: 1988 },
        { title: "Hey", slug: "hey", album: "Doolittle", year: 1989 },
      ],
    },
  ];

  const songIds: Record<string, string> = {};
  for (const a of artistData) {
    const [artist] = await db
      .insert(schema.artists)
      .values({
        name: a.name,
        slug: a.slug,
        description: a.description,
      })
      .onConflictDoNothing()
      .returning();

    const artistRow =
      artist ??
      (await db.select().from(schema.artists).where(eq(schema.artists.slug, a.slug)))[0];

    for (const s of a.songs) {
      const [song] = await db
        .insert(schema.songs)
        .values({
          artistId: artistRow.id,
          title: s.title,
          slug: s.slug,
          album: s.album,
          releaseYear: s.year,
          defaultTuning: "EADGBE",
        })
        .onConflictDoNothing()
        .returning();
      const songRow =
        song ??
        (
          await db
            .select()
            .from(schema.songs)
            .where(eq(schema.songs.slug, s.slug))
        )[0];
      songIds[`${a.slug}/${s.slug}`] = songRow.id;
    }
  }

  const manufacturers = [
    "Fender",
    "Gibson",
    "Blackstar",
    "Marshall",
    "Vox",
    "Neural DSP",
    "IK Multimedia",
    "Boss",
    "Electro-Harmonix",
    "Strymon",
    "Shure",
    "Universal Audio",
  ];

  const mfgIds: Record<string, string> = {};
  for (const name of manufacturers) {
    const [row] = await db
      .insert(schema.equipmentManufacturers)
      .values({ name, normalizedName: normalizeName(name) })
      .onConflictDoNothing()
      .returning();
    const existing =
      row ??
      (
        await db
          .select()
          .from(schema.equipmentManufacturers)
          .where(eq(schema.equipmentManufacturers.normalizedName, normalizeName(name)))
      )[0];
    mfgIds[name] = existing.id;
  }

  const gear: Array<{
    key: string;
    mfg: string;
    name: string;
    category:
      | "GUITAR"
      | "AMP"
      | "AMP_SIM"
      | "CABINET"
      | "PEDAL"
      | "MULTI_EFFECT"
      | "PLUGIN"
      | "AUDIO_INTERFACE"
      | "MICROPHONE"
      | "OTHER";
  }> = [
    { key: "jazzmaster", mfg: "Fender", name: "Jazzmaster", category: "GUITAR" },
    { key: "strat", mfg: "Fender", name: "Player Stratocaster", category: "GUITAR" },
    { key: "lespaul", mfg: "Gibson", name: "Les Paul Standard", category: "GUITAR" },
    { key: "ht20", mfg: "Blackstar", name: "HT-20R MkII", category: "AMP" },
    { key: "jcm800", mfg: "Marshall", name: "JCM800", category: "AMP" },
    { key: "ac30", mfg: "Vox", name: "AC30", category: "AMP" },
    { key: "archetype", mfg: "Neural DSP", name: "Archetype Gojira", category: "AMP_SIM" },
    { key: "fortin", mfg: "Neural DSP", name: "Fortin Nameless Suite", category: "AMP_SIM" },
    { key: "amplitube", mfg: "IK Multimedia", name: "AmpliTube 5", category: "AMP_SIM" },
    { key: "bd2", mfg: "Boss", name: "BD-2 Blues Driver", category: "PEDAL" },
    { key: "dd8", mfg: "Boss", name: "DD-8 Delay", category: "PEDAL" },
    { key: "holy", mfg: "Electro-Harmonix", name: "Holy Grail Neo", category: "PEDAL" },
    { key: "timeline", mfg: "Strymon", name: "Timeline", category: "PEDAL" },
    { key: "bigsky", mfg: "Strymon", name: "BigSky", category: "PEDAL" },
    { key: "sm57", mfg: "Shure", name: "SM57", category: "MICROPHONE" },
    { key: "apollo", mfg: "Universal Audio", name: "Apollo Twin", category: "AUDIO_INTERFACE" },
  ];

  const gearIds: Record<string, string> = {};
  for (const g of gear) {
    const [row] = await db
      .insert(schema.equipmentModels)
      .values({
        manufacturerId: mfgIds[g.mfg],
        name: g.name,
        normalizedName: normalizeName(g.name),
        category: g.category,
        isVerified: true,
        description: `${g.mfg} ${g.name}`,
      })
      .onConflictDoNothing()
      .returning();
    const existing =
      row ??
      (
        await db
          .select()
          .from(schema.equipmentModels)
          .where(eq(schema.equipmentModels.normalizedName, normalizeName(g.name)))
      )[0];
    gearIds[g.key] = existing.id;
  }

  // Parameter defs for HT-20 and Archetype
  const htParams = [
    { name: "Gain", key: "gain", min: 0, max: 10, defaultValue: "6" },
    { name: "Bass", key: "bass", min: 0, max: 10, defaultValue: "5" },
    { name: "Middle", key: "middle", min: 0, max: 10, defaultValue: "4" },
    { name: "Treble", key: "treble", min: 0, max: 10, defaultValue: "6" },
    { name: "ISF", key: "isf", min: 0, max: 10, defaultValue: "4" },
    { name: "Volume", key: "volume", min: 0, max: 10, defaultValue: "5" },
  ];
  for (const [i, p] of htParams.entries()) {
    await db.insert(schema.parameterDefinitions).values({
      equipmentModelId: gearIds.ht20,
      name: p.name,
      key: p.key,
      dataType: "NUMBER",
      unit: null,
      min: p.min,
      max: p.max,
      step: 1,
      displayOrder: i,
      defaultValue: p.defaultValue,
    });
  }

  // User gear
  for (const [userId, items] of [
    [maya.id, ["jazzmaster", "archetype", "holy", "dd8", "apollo"]],
    [diego.id, ["strat", "ht20", "bd2", "bigsky", "sm57"]],
    [priya.id, ["lespaul", "fortin", "timeline", "amplitube"]],
  ] as const) {
    for (const key of items) {
      await db.insert(schema.userGear).values({
        userId,
        equipmentModelId: gearIds[key],
        isPrimary: key === items[0],
      });
    }
  }

  async function createToneRecipe(input: {
    id: string;
    creatorId: string;
    songKey: string;
    title: string;
    description: string;
    toneType: "STUDIO" | "LIVE" | "RECREATION" | "INSPIRED_BY" | "COVER" | "CUSTOM";
    songSection:
      | "FULL_SONG"
      | "INTRO"
      | "VERSE"
      | "CHORUS"
      | "BRIDGE"
      | "RHYTHM"
      | "LEAD"
      | "SOLO"
      | "OUTRO"
      | "OTHER";
    platform: string;
    guitarKey: string;
    ampKey: string;
    notes: string;
    avgRating: number;
    ratingCount: number;
    tryCount: number;
    favoriteCount: number;
    forkedFromToneId?: string;
    chain: Array<{
      label: string;
      itemType: "GUITAR" | "AMP" | "PEDAL" | "PLUGIN" | "CABINET" | "MIC" | "OTHER";
      gearKey?: string;
      isSoftware?: boolean;
      params?: Array<{ key: string; value: number }>;
    }>;
  }) {
    const slug = toSlug(input.title);
    const [tone] = await db
      .insert(schema.tones)
      .values({
        id: input.id,
        creatorId: input.creatorId,
        songId: songIds[input.songKey],
        title: input.title,
        slug,
        description: input.description,
        toneType: input.toneType,
        songSection: input.songSection,
        status: "PUBLISHED",
        visibility: "PUBLIC",
        difficulty: 3,
        tuning: "EADGBE",
        capo: 0,
        bpm: 72,
        notes: input.notes,
        platform: input.platform,
        guitarEquipmentId: gearIds[input.guitarKey],
        ampEquipmentId: gearIds[input.ampKey],
        forkedFromToneId: input.forkedFromToneId,
        avgRating: input.avgRating,
        ratingCount: input.ratingCount,
        tryCount: input.tryCount,
        favoriteCount: input.favoriteCount,
        publishedAt: new Date(),
      })
      .onConflictDoNothing()
      .returning();

    const toneRow =
      tone ?? (await db.select().from(schema.tones).where(eq(schema.tones.id, input.id)))[0];

    const [chain] = await db
      .insert(schema.signalChains)
      .values({ toneId: toneRow.id, name: "Main" })
      .onConflictDoNothing()
      .returning();

    let chainRow = chain;
    if (!chainRow) {
      chainRow = (
        await db
          .select()
          .from(schema.signalChains)
          .where(eq(schema.signalChains.toneId, toneRow.id))
      )[0];
    }

    // clear existing items if re-seeded partially
    if (chainRow) {
      const existingItems = await db
        .select()
        .from(schema.signalChainItems)
        .where(eq(schema.signalChainItems.signalChainId, chainRow.id));
      if (existingItems.length === 0) {
        for (const [idx, item] of input.chain.entries()) {
          const [row] = await db
            .insert(schema.signalChainItems)
            .values({
              signalChainId: chainRow.id,
              position: idx,
              label: item.label,
              itemType: item.itemType,
              equipmentModelId: item.gearKey ? gearIds[item.gearKey] : null,
              isEnabled: true,
              isSoftware: item.isSoftware ?? false,
            })
            .returning();
          for (const p of item.params ?? []) {
            await db.insert(schema.parameterValues).values({
              signalChainItemId: row.id,
              key: p.key,
              dataType: "NUMBER",
              valueNumber: p.value,
            });
          }
        }
      }
    }

    return toneRow;
  }

  const blackstarTone = await createToneRecipe({
    id: "edcc90a3-7797-4a4f-8f55-838eea98a480",
    creatorId: diego.id,
    songKey: "cigarettes-after-sex/apocalypse",
    title: "Blackstar bedroom Apocalypse",
    description:
      "Soft neck-pickup Jazzmaster into a Blackstar HT-20 with plate-ish reverb and tape delay. Close studio recreation for the main rhythm figure.",
    toneType: "RECREATION",
    songSection: "RHYTHM",
    platform: "Physical",
    guitarKey: "jazzmaster",
    ampKey: "ht20",
    notes:
      "Roll tone knob back slightly. Play behind the beat. Keep gain just at the edge of breakup. Room mic blend optional.",
    avgRating: 4.7,
    ratingCount: 12,
    tryCount: 34,
    favoriteCount: 21,
    chain: [
      {
        label: "Fender Jazzmaster (neck)",
        itemType: "GUITAR",
        gearKey: "jazzmaster",
        params: [
          { key: "volume", value: 8 },
          { key: "tone", value: 6 },
        ],
      },
      {
        label: "Boss BD-2 (barely on)",
        itemType: "PEDAL",
        gearKey: "bd2",
        params: [
          { key: "gain", value: 2 },
          { key: "tone", value: 5 },
          { key: "level", value: 6 },
        ],
      },
      {
        label: "Blackstar HT-20R MkII",
        itemType: "AMP",
        gearKey: "ht20",
        params: [
          { key: "gain", value: 4 },
          { key: "bass", value: 5 },
          { key: "middle", value: 4 },
          { key: "treble", value: 6 },
          { key: "isf", value: 3 },
          { key: "volume", value: 4 },
        ],
      },
      {
        label: "Shure SM57 on cone edge",
        itemType: "MIC",
        gearKey: "sm57",
      },
      {
        label: "Strymon BigSky (plate)",
        itemType: "PEDAL",
        gearKey: "bigsky",
        params: [
          { key: "decay", value: 7 },
          { key: "predelay", value: 3 },
          { key: "mix", value: 4 },
        ],
      },
    ],
  });

  await createToneRecipe({
    id: "97b056bf-629c-40a6-8204-d033499a2956",
    creatorId: maya.id,
    songKey: "cigarettes-after-sex/apocalypse",
    title: "Neural DSP dreamy Apocalypse",
    description: "Plugin stack recreation with Archetype + ambient reverb. Great for headphones.",
    toneType: "RECREATION",
    songSection: "FULL_SONG",
    platform: "Neural DSP",
    guitarKey: "jazzmaster",
    ampKey: "archetype",
    notes: "Low gain amp, high ambient send. Double-track hard L/R.",
    avgRating: 4.4,
    ratingCount: 9,
    tryCount: 28,
    favoriteCount: 18,
    chain: [
      {
        label: "Jazzmaster DI",
        itemType: "GUITAR",
        gearKey: "jazzmaster",
      },
      {
        label: "Archetype Gojira (clean)",
        itemType: "PLUGIN",
        gearKey: "archetype",
        isSoftware: true,
        params: [
          { key: "gain", value: 2 },
          { key: "bass", value: 5 },
          { key: "mid", value: 4 },
          { key: "treble", value: 6 },
        ],
      },
      {
        label: "Holy Grail Neo",
        itemType: "PEDAL",
        gearKey: "holy",
        params: [{ key: "mix", value: 5 }],
      },
    ],
  });

  await createToneRecipe({
    id: "3568e9af-8bea-41eb-854c-ee92190cc66a",
    creatorId: priya.id,
    songKey: "cigarettes-after-sex/apocalypse",
    title: "Budget AmpliTube Apocalypse",
    description: "Stock AmpliTube amps and stock delays for a close-enough living-room version.",
    toneType: "INSPIRED_BY",
    songSection: "FULL_SONG",
    platform: "AmpliTube",
    guitarKey: "strat",
    ampKey: "amplitube",
    notes: "Use neck pickup, soft attack, plenty of reverb mix.",
    avgRating: 3.9,
    ratingCount: 6,
    tryCount: 15,
    favoriteCount: 7,
    chain: [
      { label: "Strat neck", itemType: "GUITAR", gearKey: "strat" },
      {
        label: "AmpliTube clean amp",
        itemType: "PLUGIN",
        gearKey: "amplitube",
        isSoftware: true,
        params: [
          { key: "gain", value: 3 },
          { key: "reverb", value: 6 },
        ],
      },
    ],
  });

  // Fork of Blackstar tone
  await createToneRecipe({
    id: "55909da0-fb46-4a60-857e-6706af21a902",
    creatorId: maya.id,
    songKey: "cigarettes-after-sex/apocalypse",
    title: "Blackstar Apocalypse — bedroom quiet",
    description: "Fork of Diego's Blackstar recipe with lower volume and more reverb for apartment practice.",
    toneType: "RECREATION",
    songSection: "RHYTHM",
    platform: "Physical",
    guitarKey: "jazzmaster",
    ampKey: "ht20",
    notes: "Turned volume down, bumped BigSky mix.",
    avgRating: 4.2,
    ratingCount: 3,
    tryCount: 8,
    favoriteCount: 4,
    forkedFromToneId: blackstarTone.id,
    chain: [
      { label: "Jazzmaster neck", itemType: "GUITAR", gearKey: "jazzmaster" },
      {
        label: "HT-20 quiet",
        itemType: "AMP",
        gearKey: "ht20",
        params: [
          { key: "gain", value: 4 },
          { key: "volume", value: 2 },
          { key: "treble", value: 5 },
        ],
      },
      {
        label: "BigSky",
        itemType: "PEDAL",
        gearKey: "bigsky",
        params: [{ key: "mix", value: 6 }],
      },
    ],
  });

  await createToneRecipe({
    id: "e12c9c7d-98de-4354-9e6b-29d3ea3f0c27",
    creatorId: priya.id,
    songKey: "deftones/change",
    title: "Sextape-adjacent clean wash",
    description: "Actually for Change — swirling cleans with Fortin Nameless clean path.",
    toneType: "INSPIRED_BY",
    songSection: "VERSE",
    platform: "Neural DSP",
    guitarKey: "lespaul",
    ampKey: "fortin",
    notes: "Chorus before amp, long tails.",
    avgRating: 4.5,
    ratingCount: 8,
    tryCount: 19,
    favoriteCount: 11,
    chain: [
      { label: "Les Paul", itemType: "GUITAR", gearKey: "lespaul" },
      {
        label: "Fortin Nameless",
        itemType: "PLUGIN",
        gearKey: "fortin",
        isSoftware: true,
        params: [
          { key: "gain", value: 3 },
          { key: "presence", value: 5 },
        ],
      },
    ],
  });

  await createToneRecipe({
    id: "537269fb-9db7-41d4-b7b9-6cd6a5c1e8ff",
    creatorId: diego.id,
    songKey: "radiohead/weird-fishes",
    title: "Weird Fishes arpeggi shimmer",
    description: "Delay-forward clean tone for the arpeggios.",
    toneType: "RECREATION",
    songSection: "LEAD",
    platform: "Physical",
    guitarKey: "strat",
    ampKey: "ac30",
    notes: "Sync delay to tempo subdivisions.",
    avgRating: 4.6,
    ratingCount: 10,
    tryCount: 22,
    favoriteCount: 14,
    chain: [
      { label: "Strat", itemType: "GUITAR", gearKey: "strat" },
      {
        label: "Timeline delay",
        itemType: "PEDAL",
        gearKey: "timeline",
        params: [
          { key: "mix", value: 4 },
          { key: "repeats", value: 5 },
        ],
      },
      {
        label: "Vox AC30",
        itemType: "AMP",
        gearKey: "ac30",
        params: [
          { key: "gain", value: 3 },
          { key: "treble", value: 6 },
        ],
      },
    ],
  });

  await createToneRecipe({
    id: "a50c948e-2d97-4411-b4d7-acc10f91dafe",
    creatorId: maya.id,
    songKey: "pixies/where-is-my-mind",
    title: "Where Is My Mind surf-ish",
    description: "Springy cleans with a hint of grit for the lead line.",
    toneType: "COVER",
    songSection: "LEAD",
    platform: "Physical",
    guitarKey: "strat",
    ampKey: "ac30",
    notes: "Pick near the bridge for glassy top end.",
    avgRating: 4.1,
    ratingCount: 5,
    tryCount: 12,
    favoriteCount: 9,
    chain: [
      { label: "Strat", itemType: "GUITAR", gearKey: "strat" },
      {
        label: "AC30",
        itemType: "AMP",
        gearKey: "ac30",
        params: [
          { key: "gain", value: 4 },
          { key: "reverb", value: 5 },
        ],
      },
    ],
  });

  // Community interactions on Blackstar tone
  await db
    .insert(schema.ratings)
    .values({
      userId: maya.id,
      toneId: blackstarTone.id,
      overall: 5,
      accuracy: 5,
      soundQuality: 5,
      usefulness: 5,
    })
    .onConflictDoNothing();

  await db
    .insert(schema.favorites)
    .values({ userId: maya.id, toneId: blackstarTone.id })
    .onConflictDoNothing();

  await db
    .insert(schema.toneTries)
    .values({ userId: maya.id, toneId: blackstarTone.id })
    .onConflictDoNothing();

  await db.insert(schema.toneFeedback).values({
    userId: maya.id,
    toneId: blackstarTone.id,
    tags: ["VERY_CLOSE"],
    comment: "Nailed the bloom on the chords. Slightly brighter than the record for me.",
  });

  await db.insert(schema.comments).values({
    toneId: blackstarTone.id,
    userId: maya.id,
    body: "This is the closest physical-amp take I've found. The ISF trick is everything.",
  });

  await db.insert(schema.comments).values({
    toneId: blackstarTone.id,
    userId: priya.id,
    body: "Tried it through Archetype cab IR — still holds up surprisingly well.",
  });

  console.log("Seed complete.");
  console.log("Users: admin@tone.local / maya@tone.local / diego@tone.local / priya@tone.local");
  console.log("Password for all: password123");
  console.log("Admin id:", admin.id);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
