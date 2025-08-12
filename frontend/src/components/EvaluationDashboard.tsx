'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface EvaluationData {
  id: string;
  sessionId: string;
  technicalScores: {
    frontend: number;
    backend: number;
    database: number;
    infrastructure: number;
    architecture: number;
  };
  softSkillsScores: {
    communication: number;
    problemSolving: number;
    teamwork: number;
    leadership: number;
    learning: number;
  };
  answerQualityScores: {
    accuracy: number;
    detail: number;
    clarity: number;
    structure: number;
  };
  experienceEvaluation: {
    projectScale: number;
    responsibility: number;
    achievements: number;
    relevance: number;
  };
  overallScore: number;
  recommendationGrade: string;
  strengths: string[];
  areasForImprovement: string[];
  detailedFeedback: string;
  recommendedPositions: string[];
}

interface EvaluationDashboardProps {
  evaluation: EvaluationData;
}

// 面接評価システム統一カラーパレット
const COLORS = {
  // Primary Colors (メイン)
  primary: {
    main: '#1565C0',      // プロフェッショナルブルー
    light: '#42A5F5',     // ライトブルー
    dark: '#0D47A1',      // ダークブルー
  },
  // Secondary Colors (アクセント)
  secondary: {
    main: '#37474F',      // スレートグレー
    light: '#62727B',     // ライトグレー
    dark: '#263238',      // ダークグレー
  },
  // Background Colors
  background: {
    main: '#FAFAFA',      // メインバックグラウンド
    paper: '#FFFFFF',     // カードバックグラウンド
    section: '#F5F7FA',   // セクションバックグラウンド
    // Chipバックグラウンド
    success: '#E8F5E8',   // 強み用（緑系）
    warning: '#FFF3E0',   // 改善点用（オレンジ系）
    info: '#E3F2FD',      // 情報用（ブルー系）
    purple: '#E1BEE7',    // 推奨ポジション用（パープル系）
    // プログレスバー
    progress: '#F0F0F0',  // プログレスバー背景
  },
  // Status Colors (評価グレード用)
  status: {
    excellent: '#2E7D32', // A級: 優秀 (深緑)
    good: '#388E3C',      // B級: 良好 (緑)
    average: '#F57C00',   // C級: 平均 (オレンジ)
    below: '#E64A19',     // D級: 改善必要 (赤橙)
    poor: '#C62828',     // E級: 不十分 (赤)
  },
  // Chart Colors (チャート用)
  chart: {
    primary: '#1565C0',   // プライマリチャート色
    secondary: '#42A5F5', // セカンダリチャート色
    accent1: '#26A69A',   // アクセント1 (ティール)
    accent2: '#66BB6A',   // アクセント2 (グリーン)
    accent3: '#FFA726',   // アクセント3 (オレンジ)
    accent4: '#AB47BC',   // アクセント4 (パープル)
    accent5: '#EF5350',   // アクセント5 (レッド)
  },
  // Text Colors
  text: {
    primary: '#212121',   // メインテキスト
    secondary: '#757575', // セカンダリテキスト
    disabled: '#BDBDBD',  // 無効テキスト
    hint: '#9E9E9E',     // ヒントテキスト
  }
};

// 統一Border Radius
const RADIUS = {
  small: 1,    // 小要素 (8px)
  medium: 2,   // 中要素 (16px) - カード、ボタンなど
  large: 3,    // 大要素 (24px) - ヘッダーなど
  xlarge: 4,   // 特大要素 (32px)
  progress: 4, // プログレスバー用
};

const GRADE_COLORS = {
  A: COLORS.status.excellent,
  B: COLORS.status.good,
  C: COLORS.status.average,
  D: COLORS.status.below,
  E: COLORS.status.poor,
};

const CHART_COLORS = [
  COLORS.chart.primary,
  COLORS.chart.accent1,
  COLORS.chart.accent2,
  COLORS.chart.accent3,
  COLORS.chart.accent4,
];

export default function EvaluationDashboard({ evaluation }: EvaluationDashboardProps) {
  // レーダーチャート用のデータ変換
  const radarData = [
    {
      skill: 'フロントエンド',
      score: Number(evaluation.technicalScores.frontend) || 0,
      fullMark: 100,
    },
    {
      skill: 'バックエンド',
      score: Number(evaluation.technicalScores.backend) || 0,
      fullMark: 100,
    },
    {
      skill: 'データベース',
      score: Number(evaluation.technicalScores.database) || 0,
      fullMark: 100,
    },
    {
      skill: 'インフラ',
      score: Number(evaluation.technicalScores.infrastructure) || 0,
      fullMark: 100,
    },
    {
      skill: 'アーキテクチャ',
      score: Number(evaluation.technicalScores.architecture) || 0,
      fullMark: 100,
    },
  ];

  // ソフトスキル用のバーチャートデータ
  const softSkillsData = [
    { name: 'コミュニケーション', score: Number(evaluation.softSkillsScores.communication) || 0 },
    { name: '問題解決', score: Number(evaluation.softSkillsScores.problemSolving) || 0 },
    { name: 'チームワーク', score: Number(evaluation.softSkillsScores.teamwork) || 0 },
    { name: 'リーダーシップ', score: Number(evaluation.softSkillsScores.leadership) || 0 },
    { name: '学習能力', score: Number(evaluation.softSkillsScores.learning) || 0 },
  ];

  // 回答品質用の円グラフデータ
  const qualityData = [
    { name: '正確性', value: Number(evaluation.answerQualityScores.accuracy) || 0, fill: COLORS.chart.primary },
    { name: '詳細度', value: Number(evaluation.answerQualityScores.detail) || 0, fill: COLORS.chart.accent2 },
    { name: '明確性', value: Number(evaluation.answerQualityScores.clarity) || 0, fill: COLORS.chart.accent3 },
    { name: '構造化', value: Number(evaluation.answerQualityScores.structure) || 0, fill: COLORS.chart.accent4 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return COLORS.status.excellent;
    if (score >= 80) return COLORS.status.good;
    if (score >= 70) return COLORS.status.average;
    if (score >= 60) return COLORS.status.below;
    return COLORS.status.poor;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'エキスパート';
    if (score >= 80) return '上級';
    if (score >= 70) return '中級';
    if (score >= 60) return '初級';
    return '要改善';
  };

  return (
    <Box sx={{ width: '100%', p: 3, backgroundColor: COLORS.background.main }}>
      {/* ヘッダー情報 */}
      <Paper elevation={3} sx={{ 
        p: 3, 
        mb: 3, 
        background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.dark} 100%)`, 
        color: 'white',
        borderRadius: RADIUS.large,
      }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
              面接評価ダッシュボード
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, color: 'white' }}>
              セッションID: {evaluation.sessionId}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { md: 'flex-end' } }}>
              <Typography variant="h2" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                {(Number(evaluation.overallScore) || 0).toFixed(1)}
              </Typography>
              <Chip
                label={`グレード ${evaluation.recommendationGrade}`}
                sx={{
                  backgroundColor: GRADE_COLORS[evaluation.recommendationGrade as keyof typeof GRADE_COLORS] || '#666',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  height: 40,
                  borderRadius: RADIUS.medium,
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* 技術スキル レーダーチャート */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ backgroundColor: COLORS.background.paper, borderRadius: RADIUS.medium, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: COLORS.primary.main }}>
                技術スキル評価
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tickCount={6}
                  />
                  <Radar
                    name="スコア"
                    dataKey="score"
                    stroke={COLORS.primary.main}
                    fill={COLORS.primary.main}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* ソフトスキル バーチャート */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ backgroundColor: COLORS.background.paper, borderRadius: RADIUS.medium, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: COLORS.primary.main }}>
                ソフトスキル評価
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={softSkillsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill={COLORS.chart.accent2} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 回答品質 円グラフ */}
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: COLORS.background.paper, borderRadius: RADIUS.medium, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: COLORS.primary.main }}>
                回答品質分析
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={qualityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value?.toFixed(1) || 0}`}
                    labelStyle={{ fill: COLORS.text.primary }}
                  >
                    {qualityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 経験・実績評価 */}
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: COLORS.background.paper, borderRadius: RADIUS.medium, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: COLORS.primary.main }}>
                経験・実績評価
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(evaluation.experienceEvaluation).map(([key, value]) => {
                  const labels = {
                    projectScale: 'プロジェクト規模',
                    responsibility: '責任範囲',
                    achievements: '実績',
                    relevance: '関連性',
                  };
                  return (
                    <Box key={key}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {labels[key as keyof typeof labels]}
                        </Typography>
                        <Typography variant="body2" color={getScoreColor(Number(value) || 0)}>
                          {(Number(value) || 0).toFixed(1)} ({getScoreLabel(Number(value) || 0)})
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Number(value) || 0}
                        sx={{
                          height: 8,
                          borderRadius: RADIUS.progress,
                          backgroundColor: COLORS.background.progress,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getScoreColor(Number(value) || 0),
                            borderRadius: RADIUS.progress,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 強み */}
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: COLORS.background.paper, borderRadius: RADIUS.medium, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: COLORS.primary.main }}>
                主な強み
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 3 }}>
                {evaluation.strengths.map((strength, index) => (
                  <Typography
                    key={index}
                    component="li"
                    variant="body1"
                    sx={{
                      mb: 1,
                      color: COLORS.text.primary,
                      lineHeight: 1.6,
                    }}
                  >
                    {strength}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 改善点 */}
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: COLORS.background.paper, borderRadius: RADIUS.medium, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: COLORS.primary.main }}>
                改善点
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 3 }}>
                {evaluation.areasForImprovement.map((area, index) => (
                  <Typography
                    key={index}
                    component="li"
                    variant="body1"
                    sx={{
                      mb: 1,
                      color: COLORS.text.primary,
                      lineHeight: 1.6,
                    }}
                  >
                    {area}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 推奨ポジション */}
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: COLORS.background.paper, borderRadius: RADIUS.medium, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: COLORS.primary.main }}>
                推奨ポジション
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 3 }}>
                {evaluation.recommendedPositions.map((position, index) => (
                  <Typography
                    key={index}
                    component="li"
                    variant="body1"
                    sx={{
                      mb: 1,
                      color: COLORS.text.primary,
                      lineHeight: 1.6,
                    }}
                  >
                    {position}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 詳細フィードバック */}
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: COLORS.background.paper, borderRadius: RADIUS.medium, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: COLORS.primary.main }}>
                詳細フィードバック
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6, color: COLORS.text.primary }}>
                {evaluation.detailedFeedback}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}