import { gql } from '@apollo/client';

export const AUDIO_TRANSCRIPTION_SUBSCRIPTION = gql`
  subscription AudioTranscription($sessionId: String!) {
    audioTranscription(sessionId: $sessionId) {
      sessionId
      questionId
      transcription
      timestamp
      userId
    }
  }
`;