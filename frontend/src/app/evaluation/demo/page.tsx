'use client';

import React from 'react';
import { Box } from '@mui/material';
import EvaluationDashboard from '../../../components/EvaluationDashboard';

// デモ用のテストデータ
const demoEvaluationData = {
  id: 'demo-report-1',
  sessionId: '82b5c997-5561-4535-9f18-72a0ad8483dd',
  technicalScores: {
    frontend: 85,
    backend: 78,
    database: 72,
    infrastructure: 68,
    architecture: 82,
  },
  softSkillsScores: {
    communication: 88,
    problemSolving: 92,
    teamwork: 85,
    leadership: 75,
    learning: 90,
  },
  answerQualityScores: {
    accuracy: 87,
    detail: 83,
    clarity: 89,
    structure: 85,
  },
  experienceEvaluation: {
    projectScale: 78,
    responsibility: 82,
    achievements: 88,
    relevance: 85,
  },
  overallScore: 82.5,
  recommendationGrade: 'B',
  strengths: [
    'React/Next.jsに関する深い理解',
    '問題解決能力が優秀',
    'コミュニケーション能力が高い',
    '学習意欲が非常に高い',
    '実践的なプロジェクト経験が豊富'
  ],
  areasForImprovement: [
    'インフラ・DevOps領域の知識強化',
    'リーダーシップ経験の蓄積',
    'データベース設計スキルの向上',
    '大規模システム設計の経験'
  ],
  detailedFeedback: '面接での回答は全体的に非常に良好でした。特にフロントエンド開発に関する知識は豊富で、実際のプロジェクト経験に基づいた具体的な説明ができていました。問題解決アプローチも論理的で、技術的な課題に対して適切な解決策を提示する能力があります。今後は、バックエンドやインフラ領域のスキルを強化し、より幅広い技術領域でのリーダーシップを発揮できるよう成長していくことをお勧めします。',
  recommendedPositions: [
    'フロントエンドエンジニア',
    'フルスタックエンジニア',
    'UI/UXエンジニア',
    'Webアプリケーション開発者'
  ],
};

export default function EvaluationDemoPage() {
  return (
    <Box>
      <EvaluationDashboard evaluation={demoEvaluationData} />
    </Box>
  );
}