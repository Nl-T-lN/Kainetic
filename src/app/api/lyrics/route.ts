import { NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js';
import { parseTTML, parseLRC } from '@/utils/lyricsParser';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get('trackId');
  const title = searchParams.get('title');
  let rawArtist = searchParams.get('artist') || '';
  if (rawArtist.toLowerCase() === 'unknown artist') rawArtist = '';
  const cleanArtist = rawArtist.replace(/ - Topic$/i, '').trim();

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const cleanTitle = title
    .replace(/\(.*?\)|\[.*?\]/g, "")
    .replace(/official|video|lyrics|audio|hd|hq|4k|mv/gi, "")
    .trim();

  try {
    // START FETCHES IN PARALLEL - Catch errors immediately to prevent unhandled rejections
    const boiduPromise = fetch(`https://lyrics-api.boidu.dev/getLyrics?s=${encodeURIComponent(cleanTitle)}${cleanArtist ? `&a=${encodeURIComponent(cleanArtist)}` : ''}`)
      .then(res => res.ok ? res.json() : Promise.reject('Boidu failed'))
      .then(data => {
        if (data.ttml) {
          const parsedLines = parseTTML(data.ttml);
          if (parsedLines.length > 0) return { source: 'boidu', type: 'richsync', lines: parsedLines };
        }
        throw new Error('No TTML');
      }).catch(e => ({ isError: true, error: e }));

    const lrclibPromise = fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanTitle)}${cleanArtist ? `&artist_name=${encodeURIComponent(cleanArtist)}` : ''}`)
      .then(res => res.ok ? res.json() : Promise.reject('LRCLib failed'))
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
            const syncedMatch = data.find((song: any) => song.syncedLyrics);
            if (syncedMatch) return { source: 'lrclib', type: 'richsync', lines: parseLRC(syncedMatch.syncedLyrics) };
            
            const plainMatch = data.find((song: any) => song.plainLyrics);
            if (plainMatch) return { source: 'lrclib', type: 'plain', lyrics: plainMatch.plainLyrics };
        }
        throw new Error('No LRCLib lyrics');
      }).catch(e => ({ isError: true, error: e }));

    const ytPromise = trackId ? Innertube.create().then(yt => yt.music.getLyrics(trackId))
      .then(ytLyrics => {
        const ytLyricsAny = ytLyrics as any;
        let lyricsText = ytLyricsAny?.description?.text || ytLyricsAny?.text;
        if (lyricsText) return { source: 'youtube', type: 'plain', lyrics: lyricsText };
        throw new Error('No YT lyrics');
      }).catch(e => ({ isError: true, error: e })) : Promise.resolve({ isError: true, error: 'No trackId for YT' });
      
    // EVALUATE IN PRIORITY ORDER
    
    // Priority 1: Boidu (Word Sync)
    const boiduData = await boiduPromise;
    if (!('isError' in boiduData)) {
        return NextResponse.json(boiduData);
    }

    // Capture LRCLib data for evaluation
    const lrcData = await lrclibPromise;

    // Priority 2: LRCLib Synced (Line Sync)
    if (lrcData && !('isError' in lrcData) && lrcData.type === 'richsync') {
        return NextResponse.json(lrcData);
    }

    // Priority 3: Plain Lyrics (LRCLib or YouTube)
    if (lrcData && !('isError' in lrcData) && lrcData.type === 'plain') {
        return NextResponse.json(lrcData);
    }

    const ytData = await ytPromise;
    if (!('isError' in ytData)) {
        return NextResponse.json(ytData);
    }

    // Fallback: search LRCLib without artist if all failed
    if (cleanArtist) {
        const fallbackRes = await fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanTitle)}`);
        if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            if (Array.isArray(data) && data.length > 0) {
                const syncedMatch = data.find((song: any) => song.syncedLyrics);
                if (syncedMatch) return NextResponse.json({ source: 'lrclib', type: 'richsync', lines: parseLRC(syncedMatch.syncedLyrics) });
                
                const plainMatch = data.find((song: any) => song.plainLyrics);
                if (plainMatch) return NextResponse.json({ source: 'lrclib', type: 'plain', lyrics: plainMatch.plainLyrics });
            }
        }
    }

    return NextResponse.json({ error: 'No lyrics found' }, { status: 404 });
  } catch (error) {
    console.error("Lyrics API error:", error);
    return NextResponse.json({ error: 'Failed to fetch lyrics' }, { status: 500 });
  }
}
