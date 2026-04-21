import { AudioTranscript } from '/snippets/audio-transcript.jsx';

const AUDIO_TRANSCRIPT_BASE_URL =
  'https://pub-b995142090474379a930b856ab79b4d4.r2.dev/audio';

const AUDIO_TRANSCRIPT_VOICES = [
  { id: '8ef4a238714b45718ce04243307c57a7', name: 'E-girl' },
  { id: '802e3bc2b27e49c2995d23ef70e6ac89', name: 'Energetic Male' },
  { id: '933563129e564b19a115bedd57b7406a', name: 'Sarah' },
  { id: 'bf322df2096a46f18c579d0baa36f41d', name: 'Adrian' },
  { id: 'b347db033a6549378b48d00acb0d06cd', name: 'Selene' },
  { id: '536d3a5e000945adb7038665781a4aca', name: 'Ethan' },
];

export const getPageAudioTranscriptVoices = (page) => {
  if (!page) return [];

  return AUDIO_TRANSCRIPT_VOICES.map(voice => ({
    ...voice,
    url: `${AUDIO_TRANSCRIPT_BASE_URL}/${page}/${voice.id}.mp3`,
  }));
};

export const PageAudioTranscript = ({ page }) => {
  const voices = getPageAudioTranscriptVoices(page);

  if (!voices.length) return null;

  return <AudioTranscript voices={voices} />;
};
