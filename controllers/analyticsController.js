import Query from '../models/Query.js';

const calculateAverageResolutionTime = (queries) => {
  const resolvedQueries = queries.filter(q => q.status === 'Resolved');
  if (resolvedQueries.length === 0) return 0;

  const totalTime = resolvedQueries.reduce((acc, query) => {
    const resolutionTime = query.updatedAt - query.createdAt;
    return acc + resolutionTime;
  }, 0);

  return totalTime / resolvedQueries.length;
};

const getFastestAndSlowestResolutionTime = (queries) => {
  const resolvedQueries = queries.filter(q => q.status === 'Resolved');
  if (resolvedQueries.length === 0) return { fastest: 0, slowest: 0 };

  const resolutionTimes = resolvedQueries.map(query => 
    query.updatedAt - query.createdAt
  );

  return {
    fastest: Math.min(...resolutionTimes),
    slowest: Math.max(...resolutionTimes)
  };
};

const getQueryTrends = (queries) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const lastTwoWeeks = new Date();
  lastTwoWeeks.setDate(lastTwoWeeks.getDate() - 14);

  const currentWeekQueries = queries.filter(q => q.createdAt >= lastWeek);
  const previousWeekQueries = queries.filter(q => 
    q.createdAt >= lastTwoWeeks && q.createdAt < lastWeek
  );

  const weekOnWeekGrowth = previousWeekQueries.length > 0
    ? ((currentWeekQueries.length - previousWeekQueries.length) / previousWeekQueries.length) * 100
    : 0;

  // Group queries by day for the last 30 days
  const dailyQueries = {};
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dailyQueries[dateStr] = queries.filter(q => 
      q.createdAt.toISOString().split('T')[0] === dateStr
    ).length;
  }

  return {
    weekOnWeekGrowth,
    dailyQueries
  };
};

export const getAnalytics = async (req, res) => {
  try {
    const department = req.session.department;
    const queries = await Query.find({ department });

    // Basic counts
    const totalQueries = queries.length;
    const resolvedQueries = queries.filter(q => q.status === 'Resolved').length;
    const pendingQueries = queries.filter(q => q.status === 'Pending').length;
    const inProgressQueries = queries.filter(q => q.status === 'In Progress').length;

    // Resolution times
    const avgResolutionTime = calculateAverageResolutionTime(queries);
    const { fastest, slowest } = getFastestAndSlowestResolutionTime(queries);

    // Public vs Private breakdown
    const publicQueries = queries.filter(q => q.markedPublic).length;
    const privateQueries = totalQueries - publicQueries;
    const publicConsentQueries = queries.filter(q => q.publicConsent).length;
    const publicConsentPercentage = totalQueries > 0 
      ? (publicConsentQueries / totalQueries) * 100 
      : 0;

    // Follow-up activity
    const queriesWithFollowUps = queries.filter(q => 
      q.conversationHistory && q.conversationHistory.length > 1
    ).length;
    const followUpPercentage = totalQueries > 0
      ? (queriesWithFollowUps / totalQueries) * 100
      : 0;

    // Time-based trends
    const { weekOnWeekGrowth, dailyQueries } = getQueryTrends(queries);

    res.json({
      success: true,
      analytics: {
        // KPI Cards
        totalQueries,
        resolvedQueries,
        pendingQueries,
        inProgressQueries,
        avgResolutionTime,
        fastestResolutionTime: fastest,
        slowestResolutionTime: slowest,

        // Public vs Private
        publicQueries,
        privateQueries,
        publicConsentPercentage,

        // Follow-up Activity
        followUpPercentage,

        // Time-based Trends
        weekOnWeekGrowth,
        dailyQueries
      }
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({message: 'Error generating analytics',});
  }
};