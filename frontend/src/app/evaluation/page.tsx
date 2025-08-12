'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import EvaluationDashboard from '../../components/EvaluationDashboard';
import { GET_REPORTS_BY_SESSION } from '../../graphql/queries/evaluation';

function EvaluationPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const { data, loading, error } = useQuery(GET_REPORTS_BY_SESSION, {
    variables: { sessionId },
    skip: !sessionId,
  });

  if (!sessionId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          セッションIDが指定されていません
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          評価レポートの取得に失敗しました: {error.message}
        </Alert>
      </Box>
    );
  }

  const reports = data?.getReportsBySession || [];
  
  if (reports.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          このセッションの評価レポートはまだ生成されていません
        </Alert>
      </Box>
    );
  }

  // 最新のレポートを表示
  const latestReport = reports[0];

  return (
    <Box>
      <EvaluationDashboard evaluation={latestReport} />
    </Box>
  );
}

export default function EvaluationPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    }>
      <EvaluationPageContent />
    </Suspense>
  );
}