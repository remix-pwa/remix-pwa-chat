import { PrismaClient } from "@prisma/client";

const appId = process.env.TALKJS_APP_ID;
const secretKey = process.env.TALKJS_SECRET_KEY;

const db = new PrismaClient();

async function seed() {
  const steve = await db.user.create({
    data: {
      email: "steve.awesome@me.com",
      password: "$2y$10$hZ5lHv3/hjWJwg5zeCMTyeIf1fbhoptIGu7ywbMqPomuOPhJNnc0m", // love-minecraft
      name: "Steve Works",
      avatar: "https://www.pexels.com/photo/purple-and-pink-light-digital-wallpaper-4424355/",
    }
  });

  const mara = await db.user.create({
    data: {
      email: "mara02@yahoo.home",
      name: "Mara Larson",
      password: "$2y$10$QKrYtjIDXsdS2Caugq2ILuBIw/C7a0RGod5qYLGjI5mr.Y5GomxKq", // mara.123
      avatar: "https://www.pexels.com/photo/an-astronaut-standing-in-a-desolate-environment-8474492/",
    }
  })

  const alex = await db.user.create({
    data: {
      email: "alex@hg.com",
      name: "Alex Green",
      avatar: "https://www.pexels.com/photo/photography-of-a-contemporary-hallway-1202849/",
      password: "$2y$10$K58RVwe5cp10vkxEGqVZgu6jRa.763S8zPLLohY.v51gP4YXuN..K", // alex-green 
    }
  })

  const welcomeMessage = null;

  await fetch(`https://api.talkjs.com/v1/${appId}/users/${steve.id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json" 
    }, 
    body: JSON.stringify({
      "name": steve.name,
      "email": [steve.email],
      "welcomeMessage": welcomeMessage,
      "photoUrl": steve.avatar,
      "role": "default"
    })
  })

  await fetch(`https://api.talkjs.com/v1/${appId}/users/${mara.id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json" 
    }, 
    body: JSON.stringify({
      "name": mara.name,
      "email": [mara.email],
      "welcomeMessage": welcomeMessage,
      "photoUrl": mara.avatar,
      "role": "default"
    })
  })

  await fetch(`https://api.talkjs.com/v1/${appId}/users/${alex.id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json" 
    }, 
    body: JSON.stringify({
      "name": alex.name,
      "email": [alex.email],
      "welcomeMessage": welcomeMessage,
      "photoUrl": alex.avatar,
      "role": "default"
    })
  })
}

seed();

