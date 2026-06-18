import { NextResponse } from "next/server";
import { getSharedInnertube } from "@/lib/youtube";
import { getHighResThumbnail } from "@/lib/thumbnail";

export async function GET() {
  try {
    const yt = await getSharedInnertube();
    const home = await yt.music.getHomeFeed();
    const sections: any[] = [];
    
    if (home.sections) {
      for (const section of home.sections) {
        if ('contents' in section && Array.isArray(section.contents)) {
          // Extract items (Songs, Playlists, Albums)
          const items = section.contents.filter((item: any) => 
            item.type === 'MusicResponsiveListItem' || 
            item.type === 'MusicTwoRowItem'
          );
          
          if (items.length > 0) {
            const formattedItems = items.map((item: any) => {
              const videoId = item.video_id || item.endpoint?.payload?.videoId || item.overlay?.content?.endpoint?.payload?.videoId;
              const browseId = item.endpoint?.payload?.browseId || item.id;
              
              let channelTitle = "Unknown Artist";
              if (item.authors && Array.isArray(item.authors)) {
                channelTitle = item.authors.map((a: any) => a.name).join(', ');
              } else if (item.subtitle?.text) {
                channelTitle = item.subtitle.text;
              } else if (item.subtitle?.runs) {
                channelTitle = item.subtitle.runs.map((r: any) => r.text).join('');
              } else if (item.author?.name) {
                channelTitle = item.author.name;
              } else if (item.author) {
                channelTitle = item.author;
              }

              const isSong = item.type === 'MusicResponsiveListItem' || item.item_type === 'song';
              const type = isSong ? 'song' : (item.item_type || 'playlist');

              return {
                id: browseId || videoId,
                videoId: videoId || browseId,
                title: item.title?.text || item.title || item.flexColumns?.[0]?.title?.runs?.[0]?.text || "Unknown Title",
                channelTitle: channelTitle,
                thumbnailUrl: getHighResThumbnail(item.thumbnails || item.thumbnail),
                type: type,
                durationMs: 0
              }
            }).filter((t: any) => t.id && t.thumbnailUrl);
            
            if (formattedItems.length > 0) {
              let headerText = "Trending Tracks";
              if ('header' in section && (section.header as any)?.title?.text) {
                headerText = (section.header as any).title.text;
              }
              // Skip if it's identical to an existing section
              if (!sections.find(s => s.title === headerText)) {
                sections.push({
                  title: headerText,
                  items: formattedItems
                });
              }
            }
          }
        }
      }
    }
    
    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Home Feed API Error:", error);
    return NextResponse.json({ error: "Failed to fetch home feed" }, { status: 500 });
  }
}
