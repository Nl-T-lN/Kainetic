import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";
import { getHighResThumbnail } from "@/lib/thumbnail";

let innertube: Innertube | null = null;

async function getInnertube() {
  if (!innertube) {
    innertube = await Innertube.create();
  }
  return innertube;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const artists = searchParams.get('artists');
    
    const yt = await getInnertube();
    const hitlists: any[] = [];
    
    if (artists) {
      const artistList = artists.split(',');
      const combinedItems: any[] = [];
      
      for (const artist of artistList) {
        // Search for a mix for this artist
        const searchRes = await yt.music.search(`${artist} Mix`, { type: 'playlist' }) as any;
        const results = searchRes.contents?.[0]?.contents || searchRes.results;
        
        if (results && results.length > 0) {
          const items = results.slice(0, 5).map((item: any) => ({
            id: item.id || item.endpoint?.payload?.browseId,
            title: item.title?.text || item.title || "Unknown Title",
            subtitle: item.subtitle?.text || item.author?.name || item.author || "Mix",
            thumbnailUrl: getHighResThumbnail(item.thumbnails || item.thumbnail),
            type: item.item_type || 'playlist'
          })).filter((t: any) => t.id && t.thumbnailUrl);
          
          combinedItems.push(...items);
        }
      }
      
      if (combinedItems.length > 0) {
        // Shuffle or just slice the combined items to make it interesting
        const shuffled = combinedItems.sort(() => 0.5 - Math.random()).slice(0, 15);
        hitlists.push({
          title: "Recommended Mixes",
          items: shuffled
        });
      }
    }

    if (hitlists.length < 2) {
      const home = await yt.music.getHomeFeed();
      
      if (home.sections) {
        for (const section of home.sections) {
          if ('contents' in section && Array.isArray(section.contents)) {
            const items = section.contents.filter((item: any) => 
              item.item_type === 'playlist' || item.item_type === 'album' || item.type === 'MusicTwoRowItem'
            );
            
            if (items.length > 0) {
              const formattedItems = items.map((item: any) => ({
                id: item.id || item.endpoint?.payload?.browseId,
                title: item.title?.text || "Unknown Title",
                subtitle: item.subtitle?.text || item.subtitle?.runs?.map((r:any)=>r.text).join('') || "Mix",
                thumbnailUrl: getHighResThumbnail(item.thumbnail),
                type: item.item_type || 'playlist'
              })).filter(t => t.id && t.thumbnailUrl);
              
              if (formattedItems.length > 0) {
                const headerText = ('header' in section && (section.header as any)?.title?.text) ? (section.header as any).title.text : "Hitlist";
                // Avoid duplicate section titles if we fallback
                if (!hitlists.find(h => h.title === headerText)) {
                  hitlists.push({
                    title: headerText,
                    items: formattedItems
                  });
                }
              }
            }
          }
        }
      }
    }
    
    // Only return top 2 hitlists to avoid clutter
    return NextResponse.json({ hitlists: hitlists.slice(0, 2) });
  } catch (error) {
    console.error("Home Feed API Error:", error);
    return NextResponse.json({ error: "Failed to fetch hitlist" }, { status: 500 });
  }
}
