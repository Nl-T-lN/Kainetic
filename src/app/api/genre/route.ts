import { NextResponse } from "next/server";
import { getSharedInnertube } from "@/lib/youtube";
import { getHighResThumbnail } from "@/lib/thumbnail";

// Using shared singleton from @/lib/youtube

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = searchParams.get('params');

    if (!params) {
        return NextResponse.json({ error: "Missing params parameter" }, { status: 400 });
    }

    const yt = await getSharedInnertube();
    const page = await yt.actions.execute('/browse', { browseId: 'FEmusic_moods_and_genres_category', params, client: 'YTMUSIC' });
    const pageAny = page as any;
    const sectionsRaw = pageAny.data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents;

    const sections = [];

    if (sectionsRaw) {
       for (const section of sectionsRaw) {
          const carousel = section.musicCarouselShelfRenderer;
          if (carousel) {
              const title = carousel.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text || "Section";
              
              if (carousel.contents) {
                  const items = carousel.contents.map((itemObj: any) => {
                      const item = itemObj.musicTwoRowItemRenderer || itemObj.musicResponsiveListItemRenderer;
                      if (!item) return null;
                      
                      const titleRuns = item.title?.runs;
                      const subtitleRuns = item.subtitle?.runs;
                      const titleText = titleRuns?.map((r: any) => r.text).join('') || "Unknown";
                      const subtitleText = subtitleRuns?.map((r: any) => r.text).join('') || "";
                      
                      const thumbnail = item.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url || "";
                      const highResThumb = getHighResThumbnail([{ url: thumbnail }]);

                      const id = item.navigationEndpoint?.browseEndpoint?.browseId || item.navigationEndpoint?.watchEndpoint?.videoId;

                      return {
                          id,
                          title: titleText,
                          subtitle: subtitleText,
                          thumbnailUrl: highResThumb,
                          type: itemObj.musicTwoRowItemRenderer ? "MusicTwoRowItem" : "MusicResponsiveListItem"
                      };
                  }).filter((item: any) => item && item.id);

                  if (items.length > 0) {
                      sections.push({ title, items });
                  }
              }
          }
       }
    }

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Genre API Error:", error);
    return NextResponse.json({ error: "Failed to fetch genre data" }, { status: 500 });
  }
}
