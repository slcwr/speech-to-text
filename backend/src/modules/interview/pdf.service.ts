import { Injectable } from '@nestjs/common';
import { EvaluationReportResponse } from './dto/evaluation-report.response';

@Injectable()
export class PdfService {
  generateReportHTML(report: EvaluationReportResponse): string {
    const technicalCategories = [
      { key: 'frontend', label: 'フロントエンド', score: report.technicalScores.frontend },
      { key: 'backend', label: 'バックエンド', score: report.technicalScores.backend },
      { key: 'database', label: 'データベース', score: report.technicalScores.database },
      { key: 'infrastructure', label: 'インフラ', score: report.technicalScores.infrastructure },
      { key: 'architecture', label: 'アーキテクチャ', score: report.technicalScores.architecture },
    ];

    const softSkillCategories = [
      { key: 'communication', label: 'コミュニケーション', score: report.softSkillsScores.communication },
      { key: 'problemSolving', label: '問題解決力', score: report.softSkillsScores.problemSolving },
      { key: 'teamwork', label: 'チームワーク', score: report.softSkillsScores.teamwork },
      { key: 'leadership', label: 'リーダーシップ', score: report.softSkillsScores.leadership },
      { key: 'learning', label: '学習能力', score: report.softSkillsScores.learning },
    ];

    const qualityCategories = [
      { key: 'accuracy', label: '正確性', score: report.answerQualityScores.accuracy },
      { key: 'detail', label: '詳細度', score: report.answerQualityScores.detail },
      { key: 'clarity', label: '明確性', score: report.answerQualityScores.clarity },
      { key: 'structure', label: '構造化', score: report.answerQualityScores.structure },
    ];

    const experienceCategories = [
      { key: 'projectScale', label: 'プロジェクト規模', score: report.experienceEvaluation.projectScale },
      { key: 'responsibility', label: '責任範囲', score: report.experienceEvaluation.responsibility },
      { key: 'achievements', label: '実績', score: report.experienceEvaluation.achievements },
      { key: 'relevance', label: '関連性', score: report.experienceEvaluation.relevance },
    ];

    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>面接評価レポート</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2196F3;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #1976D2;
            margin: 0;
        }
        .subtitle {
            font-size: 14px;
            color: #666;
            margin: 10px 0 0 0;
        }
        .summary-section {
            background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
        }
        .overall-score {
            font-size: 48px;
            font-weight: bold;
            color: #1976D2;
            margin: 0;
        }
        .grade {
            font-size: 36px;
            font-weight: bold;
            color: ${this.getGradeColor(report.recommendationGrade)};
            margin: 10px 0;
        }
        .section {
            margin-bottom: 30px;
            background: #fff;
            border: 1px solid #E0E0E0;
            border-radius: 8px;
            overflow: hidden;
        }
        .section-header {
            background: #F5F5F5;
            padding: 15px 20px;
            font-size: 18px;
            font-weight: bold;
            color: #333;
            border-bottom: 1px solid #E0E0E0;
        }
        .section-content {
            padding: 20px;
        }
        .score-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .score-item {
            background: #FAFAFA;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2196F3;
        }
        .score-label {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .score-value {
            font-size: 24px;
            font-weight: bold;
            color: #1976D2;
        }
        .score-bar {
            width: 100%;
            height: 8px;
            background: #E0E0E0;
            border-radius: 4px;
            margin-top: 8px;
            overflow: hidden;
        }
        .score-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            transition: width 0.3s ease;
        }
        .strengths-list, .improvements-list {
            list-style: none;
            padding: 0;
        }
        .strengths-list li {
            background: #E8F5E8;
            padding: 12px 15px;
            margin-bottom: 8px;
            border-radius: 6px;
            border-left: 4px solid #4CAF50;
        }
        .improvements-list li {
            background: #FFF3E0;
            padding: 12px 15px;
            margin-bottom: 8px;
            border-radius: 6px;
            border-left: 4px solid #FF9800;
        }
        .feedback-text {
            background: #F8F9FA;
            padding: 20px;
            border-radius: 8px;
            font-style: italic;
            border-left: 4px solid #6C757D;
        }
        .positions-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .position-tag {
            background: #E3F2FD;
            color: #1976D2;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 500;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E0E0E0;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        @media print {
            body { margin: 0; padding: 10px; }
            .section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">面接評価レポート</h1>
        <p class="subtitle">生成日時: ${new Date(report.createdAt).toLocaleString('ja-JP')}</p>
        <p class="subtitle">セッションID: ${report.sessionId}</p>
    </div>

    <div class="summary-section">
        <div class="overall-score">${report.overallScore.toFixed(1)}</div>
        <div class="grade">${report.recommendationGrade}</div>
        <p>総合評価</p>
    </div>

    <div class="section">
        <div class="section-header">技術スキル評価</div>
        <div class="section-content">
            <div class="score-grid">
                ${technicalCategories.map(cat => `
                    <div class="score-item">
                        <div class="score-label">${cat.label}</div>
                        <div class="score-value">${cat.score.toFixed(1)}</div>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${cat.score}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">ソフトスキル評価</div>
        <div class="section-content">
            <div class="score-grid">
                ${softSkillCategories.map(cat => `
                    <div class="score-item">
                        <div class="score-label">${cat.label}</div>
                        <div class="score-value">${cat.score.toFixed(1)}</div>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${cat.score}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">回答品質評価</div>
        <div class="section-content">
            <div class="score-grid">
                ${qualityCategories.map(cat => `
                    <div class="score-item">
                        <div class="score-label">${cat.label}</div>
                        <div class="score-value">${cat.score.toFixed(1)}</div>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${cat.score}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">経験・実績評価</div>
        <div class="section-content">
            <div class="score-grid">
                ${experienceCategories.map(cat => `
                    <div class="score-item">
                        <div class="score-label">${cat.label}</div>
                        <div class="score-value">${cat.score.toFixed(1)}</div>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${cat.score}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">強み</div>
        <div class="section-content">
            <ul class="strengths-list">
                ${report.strengths.map(strength => `<li>${strength}</li>`).join('')}
            </ul>
        </div>
    </div>

    <div class="section">
        <div class="section-header">改善点</div>
        <div class="section-content">
            <ul class="improvements-list">
                ${report.areasForImprovement.map(area => `<li>${area}</li>`).join('')}
            </ul>
        </div>
    </div>

    <div class="section">
        <div class="section-header">詳細フィードバック</div>
        <div class="section-content">
            <div class="feedback-text">${report.detailedFeedback}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">推奨ポジション</div>
        <div class="section-content">
            <div class="positions-list">
                ${report.recommendedPositions.map(position => `
                    <span class="position-tag">${position}</span>
                `).join('')}
            </div>
        </div>
    </div>

    <div class="footer">
        <p>このレポートは AI による分析結果です。最終的な判断は人事担当者が行ってください。</p>
        <p>© ${new Date().getFullYear()} Interview System - Generated by ${report.aiAnalysisMetadata.modelUsed}</p>
    </div>
</body>
</html>`;
  }

  private getGradeColor(grade: string): string {
    switch (grade) {
      case 'A': return '#4CAF50';
      case 'B': return '#8BC34A';
      case 'C': return '#FF9800';
      case 'D': return '#FF5722';
      case 'E': return '#F44336';
      default: return '#666';
    }
  }

  generateReportMetadata(report: EvaluationReportResponse) {
    return {
      filename: `interview-report-${report.sessionId}-${new Date().getTime()}.pdf`,
      title: '面接評価レポート',
      subject: `Session ${report.sessionId} - Grade ${report.recommendationGrade}`,
      creator: 'Interview System',
      producer: 'Interview AI Evaluation',
      creationDate: new Date(),
    };
  }
}