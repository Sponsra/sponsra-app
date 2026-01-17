"use client";

import classes from "./PulseCards.module.css";

interface PulseCardsProps {
  revenueThisMonth: number;
  revenueLastMonth: number;
  pipelineCount: number;
  occupancyData: {
    filled: number;
    total: number;
    percentage: number;
  };
}

export default function PulseCards({
  revenueThisMonth,
  revenueLastMonth,
  pipelineCount,
  occupancyData,
}: PulseCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value / 100);
  };

  const revenueDiff = revenueThisMonth - revenueLastMonth;
  const revenueTrend = revenueDiff >= 0 ? "positive" : "negative";
  const revenueDiffAbs = Math.abs(revenueDiff);

  const getOccupancyColor = () => {
    if (occupancyData.percentage >= 70) return "green";
    if (occupancyData.percentage >= 40) return "yellow";
    return "red";
  };

  const occupancyColor = getOccupancyColor();

  return (
    <div className={classes.pulseGrid}>
      {/* Card 1: Revenue */}
      <div className={`${classes.pulseCard} ${classes.revenueCard}`}>
        <div className={classes.cardHeader}>
          <div className={classes.cardTitle}>Revenue</div>
          <div className={classes.cardSubtitle}>This Month</div>
        </div>
        <div className={`${classes.cardValue} ${classes.revenueValue}`}>
          {formatCurrency(revenueThisMonth)}
        </div>
        {revenueLastMonth > 0 && (
          <div
            className={`${classes.cardTrend} ${
              revenueTrend === "positive" ? classes.trendPositive : classes.trendNegative
            }`}
          >
            <i
              className={`pi ${
                revenueTrend === "positive" ? "pi-arrow-up" : "pi-arrow-down"
              }`}
            ></i>
            <span>
              {revenueTrend === "positive" ? "+" : "-"}
              {formatCurrency(revenueDiffAbs)} vs last month
            </span>
          </div>
        )}
      </div>

      {/* Card 2: Pipeline */}
      <div className={`${classes.pulseCard} ${classes.pipelineCard}`}>
        <div className={classes.cardHeader}>
          <div className={classes.cardTitle}>Pipeline</div>
          <div className={classes.cardSubtitle}>Pending Approval</div>
        </div>
        <div className={`${classes.cardValue} ${classes.pipelineValue}`}>
          {pipelineCount}
        </div>
        {pipelineCount > 0 && (
          <div className={classes.cardWarning}>
            <i className="pi pi-exclamation-triangle"></i>
            <span>Needs your attention</span>
          </div>
        )}
      </div>

      {/* Card 3: Occupancy */}
      <div className={`${classes.pulseCard} ${classes.occupancyCard}`}>
        <div className={classes.cardHeader}>
          <div className={classes.cardTitle}>Occupancy</div>
          <div className={classes.cardSubtitle}>Next 30 Days</div>
        </div>
        <div className={classes.cardValue}>
          {occupancyData.filled}/{occupancyData.total} slots
        </div>
        <div className={classes.cardPercentage}>
          <div className={classes.percentageBarContainer}>
            <div
              className={`${classes.percentageBar} ${classes[occupancyColor]}`}
              style={{ width: `${Math.min(occupancyData.percentage, 100)}%` }}
            />
          </div>
          <span className={classes.percentageText}>
            {occupancyData.percentage.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
