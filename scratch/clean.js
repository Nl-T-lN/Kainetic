const fs = require('fs');
const files = [
  'src/app/api/ai/dj/route.ts',
  'src/app/api/party/token/route.ts',
  'src/components/PartyPanel.tsx',
  'src/hooks/useDJ.ts',
  'src/hooks/useMoodSearch.ts',
  'src/hooks/usePlayerState.ts',
  'src/hooks/useSearch.ts',
  'src/hooks/useSimilarTracks.ts',
  'src/lib/chains/djChain.ts',
  'src/lib/chains/moodChain.ts',
  'src/styles/GlobalStyles.ts',
  'src/styles/StyledRegistry.tsx',
  'src/styles/theme.ts',
  'src/types/party.ts',
  'src/types/youtube.ts'
];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let newContent = content.replace(/(?:^[ \t]*\/\/.*(?:\r?\n|$))+/gm, (match) => {
        if (match.includes('============================================================')) {
            return ''; 
        }
        return match; 
    });
    // Remove consecutive empty lines if any
    newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    fs.writeFileSync(f, newContent);
    console.log('Cleaned', f);
});
