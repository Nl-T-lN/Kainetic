import { NextResponse } from "next/server";
import { getSharedInnertube } from "@/lib/youtube";
import { getHighResThumbnail } from "@/lib/thumbnail";

// Using shared singleton from @/lib/youtube

export async function GET() {
  try {
    const yt = await getSharedInnertube();
    const explore = await yt.music.getExplore();
    
    // We will extract structured sections from explore data
    const sections = [];
    let moods: any[] = [];

    if (explore.sections) {
      for (const section of explore.sections) {
        const sectionAny = section as any;
        const title = sectionAny.header?.title?.text || sectionAny.title || "Section";
        
        if (sectionAny.contents) {
          if (sectionAny.contents[0]?.type === "MusicNavigationButton") {
              moods = sectionAny.contents.map((item: any) => ({
                  title: item.button_text || item.title || "Mood",
                  params: item.endpoint?.payload?.params
              })).filter((m: any) => m.params);
              continue;
          }

          const items = sectionAny.contents.map((item: any) => {
            const thumbnail = getHighResThumbnail(item.thumbnails || item.thumbnail);
            const id = item.id || item.video_id || item.playlist_id || item.endpoint?.payload?.browseId || item.endpoint?.payload?.videoId;
            
            // Extract subtitle/author
            let subtitle = "";
            if (item.subtitle?.text) subtitle = item.subtitle.text;
            else if (item.author?.name) subtitle = item.author.name;
            else if (item.authors?.length) subtitle = item.authors.map((a: any) => a.name).join(', ');
            else if (item.artists?.length) subtitle = item.artists.map((a: any) => a.name).join(', ');

            return {
              id,
              title: item.title?.text || item.title || "Unknown",
              subtitle,
              thumbnailUrl: thumbnail,
              type: item.type || "unknown"
            };
          }).filter((item: any) => item.id);

          if (items.length > 0) {
            sections.push({ title, items });
          }
        }
      }
    }

    // Top buttons (genres/moods)
    let buttons: any[] = [];
    if (explore.top_buttons) {
       buttons = explore.top_buttons.map((b: any) => ({
           title: b.title,
           endpoint: b.endpoint?.payload?.browseId || b.endpoint?.payload?.params
       }));
    }

    return NextResponse.json({ sections, buttons, moods });
  } catch (error) {
    console.error("Explore API Error:", error);
    return NextResponse.json({ error: "Failed to fetch explore data" }, { status: 500 });
  }
}
