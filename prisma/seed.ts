import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up existing data (order matters due to foreign keys)
  await prisma.report.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chatMember.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.userInterest.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();

  console.log("  ✓ Cleared existing data");

  // ─── 1. Create Interests ─────────────────────────────────────────────
  const interestNames = [
    "Technology",
    "Art",
    "Music",
    "Travel",
    "Food",
    "Photography",
    "Gaming",
    "Fashion",
    "Sports",
    "Science",
    "Books",
    "Movies",
    "Fitness",
    "Nature",
    "Design",
  ];

  const interestIcons: Record<string, string> = {
    Technology: "💻",
    Art: "🎨",
    Music: "🎵",
    Travel: "✈️",
    Food: "🍕",
    Photography: "📷",
    Gaming: "🎮",
    Fashion: "👗",
    Sports: "⚽",
    Science: "🔬",
    Books: "📚",
    Movies: "🎬",
    Fitness: "💪",
    Nature: "🌿",
    Design: "✏️",
  };

  const interests = await Promise.all(
    interestNames.map((name) =>
      prisma.interest.create({
        data: { name, icon: interestIcons[name] ?? "📌" },
      })
    )
  );

  console.log("  ✓ Created 15 interests");

  // ─── 2. Create Admin User ────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin#123", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@secret.com",
      username: "admin",
      name: "Admin User",
      password: adminPassword,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      bio: "Platform administrator. Keeping the void safe.",
      isVerified: true,
      isAdmin: true,
    },
  });

  console.log("  ✓ Created admin user");

  // ─── 3. Create Demo Users ────────────────────────────────────────────
  const demoUsersData = [
    {
      username: "luna_m",
      name: "Luna Martinez",
      bio: "Digital artist & creative soul. Painting the void with pixels.",
      email: "luna@example.com",
    },
    {
      username: "kai_dev",
      name: "Kai Chen",
      bio: "Full-stack developer. Coffee lover. Code is my canvas.",
      email: "kai@example.com",
    },
    {
      username: "aria_music",
      name: "Aria Johnson",
      bio: "Singer-songwriter chasing melodies across the void.",
      email: "aria@example.com",
    },
    {
      username: "marco_travels",
      name: "Marco Rossi",
      bio: "Wanderlust never rests. 47 countries and counting.",
      email: "marco@example.com",
    },
    {
      username: "zara_foodie",
      name: "Zara Ahmed",
      bio: "Food blogger & home chef. Spicing up life one recipe at a time.",
      email: "zara@example.com",
    },
    {
      username: "neo_photo",
      name: "Neo Park",
      bio: "Street photographer. Capturing light in the urban void.",
      email: "neo@example.com",
    },
    {
      username: "sage_games",
      name: "Sage Williams",
      bio: "Game designer & retro enthusiast. Pixels & progress bars.",
      email: "sage@example.com",
    },
    {
      username: "ivy_style",
      name: "Ivy Thompson",
      bio: "Fashion curator. Sustainable style in a disposable world.",
      email: "ivy@example.com",
    },
    {
      username: "rex_science",
      name: "Rex Okafor",
      bio: "Neuroscientist by day, stargazer by night. Exploring the void within.",
      email: "rex@example.com",
    },
    {
      username: "mika_books",
      name: "Mika Petrov",
      bio: "Writer & bookworm. Lost in stories, found in words.",
      email: "mika@example.com",
    },
  ];

  const defaultPassword = await bcrypt.hash("demo#123", 12);

  const demoUsers = await Promise.all(
    demoUsersData.map((u) =>
      prisma.user.create({
        data: {
          email: u.email,
          username: u.username,
          name: u.name,
          password: defaultPassword,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
          bio: u.bio,
          isVerified: Math.random() > 0.7,
        },
      })
    )
  );

  const allUsers = [admin, ...demoUsers];
  console.log("  ✓ Created 10 demo users");

  // ─── 4. Create Follow Relationships ──────────────────────────────────
  const followPairs: [number, number][] = [
    // admin follows luna_m, kai_dev, marco_travels
    [0, 1],
    [0, 2],
    [0, 4],
    // luna_m follows kai_dev, neo_photo, ivy_style
    [1, 2],
    [1, 6],
    [1, 8],
    // kai_dev follows luna_m, sage_games, admin
    [2, 1],
    [2, 7],
    [2, 0],
    // aria_music follows zara_foodie, mika_books
    [3, 5],
    [3, 10],
    // marco_travels follows luna_m, neo_photo, rex_science, aria_music
    [4, 1],
    [4, 6],
    [4, 9],
    [4, 3],
    // zara_foodie follows marco_travels, ivy_style, mika_books
    [5, 4],
    [5, 8],
    [5, 10],
    // neo_photo follows kai_dev, marco_travels, luna_m, rex_science
    [6, 2],
    [6, 4],
    [6, 1],
    [6, 9],
    // sage_games follows kai_dev, neo_photo
    [7, 2],
    [7, 6],
    // ivy_style follows zara_foodie, luna_m, aria_music
    [8, 5],
    [8, 1],
    [8, 3],
    // rex_science follows kai_dev, sage_games, neo_photo
    [9, 2],
    [9, 7],
    [9, 6],
    // mika_books follows aria_music, rex_science, luna_m
    [10, 3],
    [10, 9],
    [10, 1],
  ];

  await Promise.all(
    followPairs.map(([followerIdx, followingIdx]) =>
      prisma.follow.create({
        data: {
          followerId: allUsers[followerIdx].id,
          followingId: allUsers[followingIdx].id,
        },
      })
    )
  );

  console.log("  ✓ Created follow relationships");

  // ─── 5. Create Posts ─────────────────────────────────────────────────
  const postsData = [
    {
      authorIdx: 2, // kai_dev
      caption:
        "Just deployed my first Rust microservice. The performance difference is insane — 10x faster than our old Node service. The void runs faster now. 🦀",
      mediaUrls: JSON.stringify(["https://picsum.photos/800/600?random=1"]),
      mediaType: "image",
      tags: JSON.stringify(["technology", "rust", "code"]),
    },
    {
      authorIdx: 1, // luna_m
      caption:
        "New digital art piece: 'Echoes in the Void'. Spent 3 weeks on this one — every pixel tells a story. What do you see?",
      mediaUrls: JSON.stringify([
        "https://picsum.photos/800/600?random=2",
        "https://picsum.photos/800/600?random=3",
      ]),
      mediaType: "image",
      tags: JSON.stringify(["art", "digital", "creative"]),
    },
    {
      authorIdx: 3, // aria_music
      caption:
        "Studio session went amazing today! Recording vocals for the new EP. The acoustics in this room are pure magic. 🎵",
      mediaUrls: JSON.stringify(["https://picsum.photos/800/600?random=4"]),
      mediaType: "image",
      tags: JSON.stringify(["music", "studio", "recording"]),
    },
    {
      authorIdx: 4, // marco_travels
      caption:
        "Sunrise over Santorini. Some views make you forget the void even exists. 3 weeks into the Mediterranean tour and still pinching myself.",
      mediaUrls: JSON.stringify([
        "https://picsum.photos/800/600?random=5",
        "https://picsum.photos/800/600?random=6",
        "https://picsum.photos/800/600?random=7",
      ]),
      mediaType: "image",
      tags: JSON.stringify(["travel", "greece", "sunrise"]),
    },
    {
      authorIdx: 5, // zara_foodie
      caption:
        "Homemade ramen from scratch — 12 hour broth, fresh noodles, the works. The void has never tasted so good. 🍜",
      mediaUrls: JSON.stringify(["https://picsum.photos/800/600?random=8"]),
      mediaType: "image",
      tags: JSON.stringify(["food", "ramen", "cooking"]),
    },
    {
      authorIdx: 6, // neo_photo
      caption:
        "Golden hour in Tokyo. The way light bends through these narrow streets is something else. #StreetPhotography",
      mediaUrls: JSON.stringify(["https://picsum.photos/800/600?random=9"]),
      mediaType: "image",
      tags: JSON.stringify(["photography", "tokyo", "goldnehour"]),
    },
    {
      authorIdx: 7, // sage_games
      caption:
        "Finally beat the final boss after 47 attempts. The satisfaction is indescribable. Sometimes the void fights back, but so do I. 🎮",
      mediaUrls: null,
      mediaType: "image",
      tags: JSON.stringify(["gaming", "bossfight", "retro"]),
    },
    {
      authorIdx: 8, // ivy_style
      caption:
        "Thrift haul of the century! Vintage YSL blazer for $12. Sustainable fashion is the only fashion. The void doesn't need more waste.",
      mediaUrls: JSON.stringify(["https://picsum.photos/800/600?random=10"]),
      mediaType: "image",
      tags: JSON.stringify(["fashion", "thrift", "sustainable"]),
    },
    {
      authorIdx: 9, // rex_science
      caption:
        "Just published our paper on neural plasticity in adult brains. The void between neurons is where the magic happens — literally. Synaptic gaps are underrated.",
      mediaUrls: null,
      mediaType: "image",
      tags: JSON.stringify(["science", "neuroscience", "research"]),
    },
    {
      authorIdx: 10, // mika_books
      caption:
        "Finished reading 'The Midnight Library' in one sitting. Sometimes the hardest void to fill is the one between who you are and who you could have been.",
      mediaUrls: JSON.stringify(["https://picsum.photos/800/600?random=11"]),
      mediaType: "image",
      tags: JSON.stringify(["books", "reading", "fiction"]),
    },
    {
      authorIdx: 2, // kai_dev
      caption:
        "Open source contribution #100 merged! 🎉 Started contributing 2 years ago and it's been the most rewarding journey. The void gives back what you put in.",
      mediaUrls: null,
      mediaType: "image",
      tags: JSON.stringify(["technology", "opensource", "code"]),
    },
    {
      authorIdx: 1, // luna_m
      caption:
        "Work in progress — experimenting with generative AI + hand painting hybrid style. The void between human and machine creativity is where it gets interesting.",
      mediaUrls: JSON.stringify([
        "https://picsum.photos/800/600?random=12",
        "https://picsum.photos/800/600?random=13",
      ]),
      mediaType: "image",
      tags: JSON.stringify(["art", "ai", "generative"]),
    },
    {
      authorIdx: 4, // marco_travels
      caption:
        "Street food tour in Bangkok — pad thai that changed my entire worldview. $1.50 for a life-altering experience. The void tastes like tamarind.",
      mediaUrls: JSON.stringify(["https://picsum.photos/800/600?random=14"]),
      mediaType: "image",
      tags: JSON.stringify(["travel", "food", "bangkok"]),
    },
    {
      authorIdx: 6, // neo_photo
      caption:
        "Rain-soaked neon reflections are my love language. Tokyo after midnight. 🌧️",
      mediaUrls: JSON.stringify(["https://picsum.photos/800/600?random=15"]),
      mediaType: "image",
      tags: JSON.stringify(["photography", "neon", "rain"]),
    },
    {
      authorIdx: 5, // zara_foodie
      caption:
        "Farm to table dinner party last night. Everything grown within 10 miles of home. There's something profoundly grounding about knowing where your food comes from.",
      mediaUrls: JSON.stringify([
        "https://picsum.photos/800/600?random=16",
        "https://picsum.photos/800/600?random=17",
      ]),
      mediaType: "image",
      tags: JSON.stringify(["food", "farmtotable", "sustainable"]),
    },
    {
      authorIdx: 3, // aria_music
      caption:
        "Writing lyrics at 3am. The void is loudest when the world is quiet. New song about finding light in unexpected places. 🌙",
      mediaUrls: null,
      mediaType: "image",
      tags: JSON.stringify(["music", "songwriting", "nightowl"]),
    },
    {
      authorIdx: 9, // rex_science
      caption:
        "Stargazing session with the telescope. Captured Jupiter and 4 of its moons. We are so small in this vast void, and that's beautiful.",
      mediaUrls: JSON.stringify(["https://picsum.photos/800/600?random=18"]),
      mediaType: "image",
      tags: JSON.stringify(["science", "astronomy", "jupiter"]),
    },
    {
      authorIdx: 8, // ivy_style
      caption:
        "Capsule wardrobe challenge: 30 pieces, 30 days. Day 15 and I've never felt more creative with less. The void teaches restraint.",
      mediaUrls: JSON.stringify(["https://picsum.photos/800/600?random=19"]),
      mediaType: "image",
      tags: JSON.stringify(["fashion", "minimalism", "capsule"]),
    },
    {
      authorIdx: 7, // sage_games
      caption:
        "Game jam weekend! 48 hours to build a game from scratch. Our team is making a puzzle platformer set in a void dimension. Let's go! 🚀",
      mediaUrls: JSON.stringify(["https://picsum.photos/800/600?random=20"]),
      mediaType: "image",
      tags: JSON.stringify(["gaming", "gamejam", "indie"]),
    },
    {
      authorIdx: 0, // admin
      caption:
        "Welcome to Social Void! This platform is a space for authentic expression. No algorithms deciding what you see — just real people sharing real things. Fill the void your way.",
      mediaUrls: null,
      mediaType: "image",
      tags: JSON.stringify(["announcement", "socialvoid", "community"]),
    },
  ];

  const posts = await Promise.all(
    postsData.map((p) =>
      prisma.post.create({
        data: {
          caption: p.caption,
          mediaUrls: p.mediaUrls,
          mediaType: p.mediaType,
          tags: p.tags,
          authorId: allUsers[p.authorIdx].id,
        },
      })
    )
  );

  console.log("  ✓ Created 20 posts");

  // ─── 6. Create Likes ─────────────────────────────────────────────────
  // Each user likes 3-8 posts (avoiding duplicate likes and self-likes on own posts)
  const likePairs: [number, number][] = [
    // admin likes posts by others
    [0, 1], [0, 3], [0, 5], [0, 9], [0, 19],
    // luna_m likes posts
    [1, 0], [1, 6], [1, 10], [1, 11], [1, 16],
    // kai_dev likes posts
    [2, 1], [2, 5], [2, 7], [2, 12],
    // aria_music likes posts
    [3, 4], [3, 8], [3, 10], [3, 15], [3, 18],
    // marco_travels likes posts
    [4, 3], [4, 5], [4, 6], [4, 13], [4, 14], [4, 19],
    // zara_foodie likes posts
    [5, 4], [5, 8], [5, 12], [5, 14], [5, 17],
    // neo_photo likes posts
    [6, 1], [6, 5], [6, 13], [6, 15], [6, 18],
    // sage_games likes posts
    [7, 0], [7, 6], [7, 18], [7, 19],
    // ivy_style likes posts
    [8, 1], [8, 7], [8, 14], [8, 17], [8, 19],
    // rex_science likes posts
    [9, 0], [9, 9], [9, 16], [9, 19],
    // mika_books likes posts
    [10, 9], [10, 8], [10, 15], [10, 19],
  ];

  await Promise.all(
    likePairs.map(([userIdx, postIdx]) =>
      prisma.like.create({
        data: {
          userId: allUsers[userIdx].id,
          postId: posts[postIdx].id,
        },
      })
    )
  );

  console.log("  ✓ Created likes");

  // ─── 7. Create Comments (including nested replies) ───────────────────
  const commentsData = [
    // Comments on post 1 (luna_m's digital art)
    {
      postIdx: 1,
      authorIdx: 6, // neo_photo
      content: "The color palette is stunning! How did you achieve that gradient effect?",
      parentId: null,
    },
    {
      postIdx: 1,
      authorIdx: 1, // luna_m (reply to neo_photo)
      content: "Thanks! It's a combination of gradient maps and custom brushes in Procreate. Happy to share the process!",
      parentId: "previous", // will be resolved after creation
    },
    {
      postIdx: 1,
      authorIdx: 8, // ivy_style
      content: "This would make an amazing fabric print. Have you considered merch?",
      parentId: null,
    },

    // Comments on post 0 (kai_dev's rust post)
    {
      postIdx: 0,
      authorIdx: 7, // sage_games
      content: "Rust is on my to-learn list! Any resources you'd recommend for a JavaScript developer?",
      parentId: null,
    },
    {
      postIdx: 0,
      authorIdx: 2, // kai_dev (reply to sage_games)
      content: "Definitely start with 'The Rust Programming Language' book — it's free online. The ownership model clicks after a few weeks of practice.",
      parentId: "previous",
    },
    {
      postIdx: 0,
      authorIdx: 9, // rex_science
      content: "We switched our data pipeline to Rust too. The memory safety guarantees are worth the learning curve.",
      parentId: null,
    },

    // Comments on post 4 (marco_travels's Santorini)
    {
      postIdx: 4,
      authorIdx: 5, // zara_foodie
      content: "Santorini is magical! Did you try the tomatokeftedes? Best fritters of my life.",
      parentId: null,
    },
    {
      postIdx: 4,
      authorIdx: 4, // marco_travels (reply to zara)
      content: "YES! Had them at a cliffside taverna in Oia. Life-changing. Also the fava was incredible.",
      parentId: "previous",
    },
    {
      postIdx: 4,
      authorIdx: 1, // luna_m
      content: "Adding this to my bucket list. The colors in your photos are unreal. 🌅",
      parentId: null,
    },

    // Comments on post 5 (zara's ramen)
    {
      postIdx: 5,
      authorIdx: 3, // aria_music
      content: "12 hours?! That's dedication. I can barely wait 12 minutes for instant ramen 😂",
      parentId: null,
    },
    {
      postIdx: 5,
      authorIdx: 5, // zara_foodie (reply to aria)
      content: "Haha most of it is passive! But the aroma filling the house for 12 hours is torture. Worth it though!",
      parentId: "previous",
    },

    // Comments on post 19 (admin's welcome post)
    {
      postIdx: 19,
      authorIdx: 2, // kai_dev
      content: "Love this platform! No algorithm manipulation is exactly what we need. Building something real here.",
      parentId: null,
    },
    {
      postIdx: 19,
      authorIdx: 10, // mika_books
      content: "Finally a space that feels authentic. Excited to be part of this community!",
      parentId: null,
    },

    // Comments on post 18 (sage's game jam)
    {
      postIdx: 18,
      authorIdx: 2, // kai_dev
      content: "A void dimension puzzle platformer? Count me in for playtesting! Sounds right up my alley.",
      parentId: null,
    },

    // Comments on post 9 (rex's neuroscience paper)
    {
      postIdx: 9,
      authorIdx: 10, // mika_books
      content: "The way you bridge hard science with poetic language is inspiring. 'The void between neurons where magic happens' — that's a book title right there.",
      parentId: null,
    },
  ];

  // Create comments in order, resolving parent references
  const createdComments: { id: string }[] = [];
  for (const cd of commentsData) {
    const parentId =
      cd.parentId === "previous" && createdComments.length > 0
        ? createdComments[createdComments.length - 1].id
        : null;

    const comment = await prisma.comment.create({
      data: {
        content: cd.content,
        postId: posts[cd.postIdx].id,
        authorId: allUsers[cd.authorIdx].id,
        parentId,
      },
    });
    createdComments.push(comment);
  }

  console.log("  ✓ Created 15 comments (with nested replies)");

  // ─── 8. Create Chats & Messages ──────────────────────────────────────
  // Chat 1: Direct message between luna_m and kai_dev
  const dmChat1 = await prisma.chat.create({
    data: {
      isGroup: false,
    },
  });

  await prisma.chatMember.createMany({
    data: [
      { chatId: dmChat1.id, userId: allUsers[1].id, role: "member" },
      { chatId: dmChat1.id, userId: allUsers[2].id, role: "member" },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        chatId: dmChat1.id,
        senderId: allUsers[1].id,
        content: "Hey Kai! I saw your Rust post. Really impressive stuff!",
        isRead: true,
      },
      {
        chatId: dmChat1.id,
        senderId: allUsers[2].id,
        content: "Thanks Luna! Means a lot coming from you. Your latest artwork is incredible btw.",
        isRead: true,
      },
      {
        chatId: dmChat1.id,
        senderId: allUsers[1].id,
        content: "Aww thanks! Want to collab on something? I've been thinking about generative art with real data.",
        isRead: true,
      },
      {
        chatId: dmChat1.id,
        senderId: allUsers[2].id,
        content: "That sounds amazing! I could build the data pipeline and you handle the visuals. Let's do it! 🚀",
        isRead: false,
      },
    ],
  });

  // Chat 2: Direct message between marco_travels and zara_foodie
  const dmChat2 = await prisma.chat.create({
    data: {
      isGroup: false,
    },
  });

  await prisma.chatMember.createMany({
    data: [
      { chatId: dmChat2.id, userId: allUsers[4].id, role: "member" },
      { chatId: dmChat2.id, userId: allUsers[5].id, role: "member" },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        chatId: dmChat2.id,
        senderId: allUsers[4].id,
        content: "Zara! I'm planning a food tour in Bangkok next month. You in?",
        isRead: true,
      },
      {
        chatId: dmChat2.id,
        senderId: allUsers[5].id,
        content: "UM YES. I've been dying to go back. The street food scene is unreal.",
        isRead: true,
      },
      {
        chatId: dmChat2.id,
        senderId: allUsers[4].id,
        content: "Perfect! I'll send you my itinerary. We're hitting Chinatown, Chatuchak market, and this hidden noodle spot a local told me about.",
        isRead: false,
      },
    ],
  });

  // Chat 3: Group chat - Creative Collective
  const groupChat1 = await prisma.chat.create({
    data: {
      name: "Creative Collective",
      isGroup: true,
      avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=creative",
      createdBy: allUsers[1].id,
    },
  });

  await prisma.chatMember.createMany({
    data: [
      { chatId: groupChat1.id, userId: allUsers[1].id, role: "admin" },
      { chatId: groupChat1.id, userId: allUsers[2].id, role: "member" },
      { chatId: groupChat1.id, userId: allUsers[3].id, role: "member" },
      { chatId: groupChat1.id, userId: allUsers[6].id, role: "member" },
      { chatId: groupChat1.id, userId: allUsers[8].id, role: "member" },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        chatId: groupChat1.id,
        senderId: allUsers[1].id,
        content: "Welcome to the Creative Collective! This is our space to share ideas, get feedback, and collaborate. 🎨",
        isRead: true,
      },
      {
        chatId: groupChat1.id,
        senderId: allUsers[3].id,
        content: "So excited to be here! I've been wanting to blend music with visual art for a while.",
        isRead: true,
      },
      {
        chatId: groupChat1.id,
        senderId: allUsers[6].id,
        content: "I can contribute photography and video. Moving images could add a whole new dimension.",
        isRead: true,
      },
      {
        chatId: groupChat1.id,
        senderId: allUsers[8].id,
        content: "Fashion + art + music = the ultimate crossover. I'm in!",
        isRead: true,
      },
      {
        chatId: groupChat1.id,
        senderId: allUsers[2].id,
        content: "I'll handle the tech side. Interactive installations, AR experiences, you name it.",
        isRead: false,
      },
    ],
  });

  // Chat 4: Group chat - Wanderlust Kitchen
  const groupChat2 = await prisma.chat.create({
    data: {
      name: "Wanderlust Kitchen",
      isGroup: true,
      avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=wanderlust",
      createdBy: allUsers[4].id,
    },
  });

  await prisma.chatMember.createMany({
    data: [
      { chatId: groupChat2.id, userId: allUsers[4].id, role: "admin" },
      { chatId: groupChat2.id, userId: allUsers[5].id, role: "member" },
      { chatId: groupChat2.id, userId: allUsers[10].id, role: "member" },
      { chatId: groupChat2.id, userId: allUsers[9].id, role: "member" },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        chatId: groupChat2.id,
        senderId: allUsers[4].id,
        content: "Food + travel enthusiasts unite! Share your best culinary discoveries from around the world 🌍🍜",
        isRead: true,
      },
      {
        chatId: groupChat2.id,
        senderId: allUsers[5].id,
        content: "I'll start! Best thing I ate this month: handmade tortellini in Bologna. The pasta was thinner than paper.",
        isRead: true,
      },
      {
        chatId: groupChat2.id,
        senderId: allUsers[10].id,
        content: "I found this amazing cookbook about street food across Southeast Asia. Want me to share some recipes?",
        isRead: true,
      },
      {
        chatId: groupChat2.id,
        senderId: allUsers[9].id,
        content: "Fun fact: the Maillard reaction (what makes seared food taste amazing) was first described by a French chemist. Science makes food better! 🔬",
        isRead: false,
      },
    ],
  });

  console.log("  ✓ Created 4 chats with messages (2 DMs, 2 groups)");

  // ─── 9. Create User-Interest Associations ────────────────────────────
  const userInterestPairs: [number, number][] = [
    // admin - Technology, Design
    [0, 0],
    [0, 14],
    // luna_m - Art, Design, Photography
    [1, 1],
    [1, 14],
    [1, 5],
    // kai_dev - Technology, Gaming, Science
    [2, 0],
    [2, 6],
    [2, 9],
    // aria_music - Music, Art, Movies
    [3, 2],
    [3, 1],
    [3, 11],
    // marco_travels - Travel, Food, Photography, Nature
    [4, 3],
    [4, 4],
    [4, 5],
    [4, 13],
    // zara_foodie - Food, Travel, Books
    [5, 4],
    [5, 3],
    [5, 10],
    // neo_photo - Photography, Art, Travel, Nature
    [6, 5],
    [6, 1],
    [6, 3],
    [6, 13],
    // sage_games - Gaming, Technology, Design
    [7, 6],
    [7, 0],
    [7, 14],
    // ivy_style - Fashion, Art, Design
    [8, 7],
    [8, 1],
    [8, 14],
    // rex_science - Science, Nature, Books, Fitness
    [9, 9],
    [9, 13],
    [9, 10],
    [9, 12],
    // mika_books - Books, Movies, Music
    [10, 10],
    [10, 11],
    [10, 2],
  ];

  await Promise.all(
    userInterestPairs.map(([userIdx, interestIdx]) =>
      prisma.userInterest.create({
        data: {
          userId: allUsers[userIdx].id,
          interestId: interests[interestIdx].id,
        },
      })
    )
  );

  console.log("  ✓ Created user-interest associations");

  // ─── 10. Create Reports ──────────────────────────────────────────────
  await prisma.report.createMany({
    data: [
      {
        reporterId: allUsers[7].id, // sage_games reports
        reportedId: allUsers[8].id, // ivy_style (spam-like behavior)
        reason: "Posting repetitive promotional content across multiple posts",
        status: "pending",
      },
      {
        reporterId: allUsers[10].id, // mika_books reports
        postId: posts[7].id, // ivy_style's thrift post
        reason: "Misleading claims about product pricing and availability",
        status: "pending",
      },
    ],
  });

  console.log("  ✓ Created 2 reports");
  console.log("\n✅ Seed completed successfully!");
  console.log(`   Users: ${allUsers.length} (1 admin + 10 demo)`);
  console.log(`   Interests: ${interests.length}`);
  console.log(`   Posts: ${posts.length}`);
  console.log(`   Comments: ${createdComments.length}`);
  console.log(`   Chats: 4 (2 DM + 2 group)`);
  console.log(`   Reports: 2`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
