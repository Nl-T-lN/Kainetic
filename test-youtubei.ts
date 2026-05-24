import { Innertube } from 'youtubei.js';

async function test() {
  const youtube = await Innertube.create();
  console.log("Created innertube client.");
  
  const searchResults = await youtube.music.search('Daft Punk Get Lucky', { type: 'song' });
  
  if (searchResults.results && searchResults.results.length > 0) {
    const firstResult = searchResults.results[0];
    console.log(JSON.stringify(firstResult, null, 2));
  } else {
    console.log("No results");
  }
}

test().catch(console.error);
