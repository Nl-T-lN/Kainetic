const { Innertube } = require("youtubei.js");

async function main() {
  const yt = await Innertube.create();
  const trackId = "GcY-5alayP8"; // SKINNY
  const info = await yt.music.getInfo(trackId);
  
  const upNext = await yt.music.getUpNext(trackId);
  console.log("UpNext keys:", Object.keys(upNext));
  console.log("UpNext contents count:", upNext.contents?.length);
  if (upNext.contents?.length) {
    console.log("First UpNext track:", upNext.contents[0].title);
  }
}
main();
