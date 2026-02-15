import Schedule from "../src/models/Schedule.js";

const test = async () => {
  const newSchedule = await Schedule.create({
    s3Url: "https://example.com/video.mp4",
    chatId: "123456789",
    sendAt: new Date(Date.now() + 60000), // 1 min later
  });

  console.log(newSchedule);
};
