import { NextResponse } from "next/server";
import { getSharedInnertube } from "@/lib/youtube";
import { getHighResThumbnail } from "@/lib/thumbnail";

// Using shared singleton from @/lib/youtube

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const artists = searchParams.get('artists');
    
    const yt = await getSharedInnertube();
    const hitlists: any[] = [];
    
    if (artists) {
      const artistList = artists.split(',');
      const combinedItems: any[] = [];
      const seenIds = new Set<string>();
      
      for (const artist of artistList) {
        // Search for a mix and albums for this artist
        const searchRes = await yt.music.search(`${artist}`, { type: 'playlist' }) as any;
        const albumRes = await yt.music.search(`${artist}`, { type: 'album' }) as any;
        
        const mixResults = searchRes.contents?.[0]?.contents || searchRes.results || [];
        const albumResults = albumRes.contents?.[0]?.contents || albumRes.results || [];
        
        const allResults = [...mixResults.slice(0, 3), ...albumResults.slice(0, 3)];
        
        for (const item of allResults) {
          const id = item.id || item.endpoint?.payload?.browseId;
          if (id && !seenIds.has(id)) {
            seenIds.add(id);
            combinedItems.push({
              id: id,
              title: item.title?.text || item.title || "Unknown Title",
              subtitle: item.subtitle?.text || item.author?.name || item.author || "Mix",
              thumbnailUrl: getHighResThumbnail(item.thumbnails || item.thumbnail),
              type: item.item_type || 'playlist'
            });
          }
        }
      }
      
      const validItems = combinedItems.filter(t => t.id && t.thumbnailUrl);
      
      if (validItems.length > 0) {
        // Shuffle the combined items to limit redundancy and make it interesting
        const shuffled = validItems.sort(() => 0.5 - Math.random()).slice(0, 15);
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
