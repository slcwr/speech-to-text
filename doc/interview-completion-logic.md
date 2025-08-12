# 面接完了判定ロジック

## 現在の実装
```typescript
const isInterviewComplete = !nextQuestion;
```

## 改善提案

### 1. 基本的な判定方法
```typescript
// 方法A: 次の質問の存在チェック（現在の実装）
const nextQuestion = await this.questionRepository.findOne({
  where: {
    sessionId: sessionId,
    question_order: currentQuestion.question_order + 1,
  }
});
const isComplete = !nextQuestion;
```

### 2. より堅牢な判定方法
```typescript
// 方法B: 全質問数と完了数の比較
async isInterviewComplete(sessionId: string): Promise<boolean> {
  // 総質問数を取得
  const totalQuestions = await this.questionRepository.count({
    where: { sessionId }
  });
  
  // 完了した回答数を取得
  const completedAnswers = await this.answerRepository.count({
    where: { 
      question_id: In(
        await this.questionRepository.find({ 
          where: { sessionId },
          select: ['id'] 
        }).then(questions => questions.map(q => q.id))
      ),
      answer_status: AnswerStatus.COMPLETED
    }
  });
  
  return completedAnswers >= totalQuestions;
}
```

### 3. 最も安全な判定方法（推奨）
```typescript
async checkInterviewCompletion(sessionId: string, currentQuestionId: string): Promise<{
  isComplete: boolean;
  progress: {
    completed: number;
    total: number;
    remaining: number;
  };
  nextQuestion?: InterviewQuestion;
}> {
  // セッション内の全質問を取得（順序付き）
  const allQuestions = await this.questionRepository.find({
    where: { sessionId },
    order: { question_order: 'ASC' }
  });
  
  // 現在の質問のインデックスを取得
  const currentIndex = allQuestions.findIndex(q => q.id === currentQuestionId);
  
  if (currentIndex === -1) {
    throw new NotFoundException('Current question not found in session');
  }
  
  // 次の質問があるかチェック
  const nextQuestion = allQuestions[currentIndex + 1] || null;
  const isComplete = !nextQuestion;
  
  // 完了した回答数をカウント
  const completedCount = await this.answerRepository.count({
    where: {
      question_id: In(allQuestions.slice(0, currentIndex + 1).map(q => q.id)),
      answer_status: AnswerStatus.COMPLETED
    }
  });
  
  return {
    isComplete,
    progress: {
      completed: completedCount,
      total: allQuestions.length,
      remaining: allQuestions.length - completedCount
    },
    nextQuestion
  };
}
```

## 使用する判定方法

### 推奨：**方法3（最も安全）**
- **理由**：
  - 質問の順序を正確に管理
  - 進捗状況を詳細に把握
  - エラーハンドリングが充実
  - 将来の拡張性が高い

### 実装時の考慮点
1. **質問の動的追加**: 面接中に質問が追加される可能性
2. **スキップ機能**: 特定の質問をスキップする場合
3. **エラー回復**: 通信エラー等で回答が失われた場合
4. **進捗表示**: ユーザーに現在の進捗を表示

### レポート生成トリガー
```typescript
if (completionResult.isComplete) {
  // 面接セッション完了処理
  await this.completeInterviewSession(sessionId);
  
  // 評価レポート生成をキューに追加
  await this.evaluationService.generateReport(sessionId);
}
```